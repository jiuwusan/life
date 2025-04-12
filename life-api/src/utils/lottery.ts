type CheckLotteryResult = {
  type: string;
  fronts: string[];
  backs: string[];
  prize: number;
};

/**
 * 获取 中奖等级
 */
export const getPrize = (type: string, frontHits: number, backHits: number) => {
  const prizes: number[][] = Array.from({ length: 7 }, () => Array(3).fill(-1));
  switch (type) {
    // 超级大乐透
    case 'sp':
      prizes[5][2] = 1;
      prizes[5][1] = 2;
      prizes[5][0] = 3;
      prizes[4][2] = 4;
      prizes[4][1] = 5;
      prizes[3][2] = 6;
      prizes[4][0] = 7;
      prizes[2][2] = 8;
      prizes[3][1] = 8;
      prizes[3][0] = 9;
      prizes[0][2] = 9;
      prizes[1][2] = 9;
      prizes[2][1] = 9;
      break;
    // 双色球
    case 'wf':
      prizes[6][1] = 1;
      prizes[6][0] = 2;
      prizes[5][1] = 3;
      prizes[5][0] = 4;
      prizes[4][1] = 4;
      prizes[4][0] = 5;
      prizes[3][1] = 5;
      prizes[2][1] = 6;
      prizes[1][1] = 6;
      prizes[0][1] = 6;
      break;
    default:
      throw new Error('Lottery Type 异常');
  }

  return prizes[frontHits][backHits];
};

/**
 * 验奖
 * @param lotteryNumbers
 * @param userNumbers
 * @returns
 */
export const checkLottery = (type: string, lotteryNumbers: Array<string>, userNumbers: Array<string>): CheckLotteryResult => {
  const current = {
    sp: {
      front: [0, 5],
      back: -2
    },
    wf: {
      front: [0, 6],
      back: -1
    }
  }[type];
  const frontNumbers = lotteryNumbers.slice(...current.front);
  const backNumbers = lotteryNumbers.slice(current.back);
  const userFrontNumbers = userNumbers.slice(...current.front);
  const userBackNumbers = userNumbers.slice(current.back);
  const fronts = userFrontNumbers.filter(item => frontNumbers.includes(item));
  const backs = userBackNumbers.filter(item => backNumbers.includes(item));
  return {
    type,
    fronts,
    backs,
    prize: getPrize(type, fronts.length, backs.length)
  };
};

/**
 * 创建池
 */
export const createBallsPool = (max = 0, min = 1, exclude?: Array<string>) => {
  const value = [];
  const excludeSet = exclude ? new Set(exclude) : null;

  for (let index = min; index <= max; index++) {
    const ball = index < 10 ? `0${index}` : `${index}`;
    if (excludeSet && excludeSet.has(ball)) {
      continue;
    }
    value.push(ball);
  }

  return value;
};

/**
 * 确保每个元素都有相等的概率被选中
 *
 * @param {*} array
 * @returns
 */
export const shuffleArray = (array, iterations = 1997) => {
  if (array?.length < 1) {
    return array;
  }
  const result = array.slice();
  const len = result.length;

  for (let i = 0; i < iterations; i++) {
    for (let j = len - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [result[j], result[k]] = [result[k], result[j]];
    }
  }

  return result;
};

/**
 * 获取随机串
 *
 * @param {*} max
 * @param {*} num
 */
export const getRandomNumbers = (bets, count, sequence?: boolean) => {
  const shuffled = sequence ? bets : shuffleArray(bets); // 洗牌
  const result = shuffled[sequence ? 'splice' : 'slice'](0, count); // 取前 count 个数
  // 正序排列
  result.sort((a, b) => parseInt(a) - parseInt(b));
  return result;
};

/**
 * 批量验奖
 * @param lotteryNumbers
 * @param multiUserNumbers
 * @returns
 */
export const batchCheckLottery = (type: string, lotteryNumbers: Array<string> | string, multiUserNumbers: Array<Array<string>> | string): CheckLotteryResult[] => {
  const result = [];
  // 将字符串转换为数组
  const lotteryList = Array.isArray(lotteryNumbers) ? lotteryNumbers : lotteryNumbers.split(' ');
  const multiUserList = Array.isArray(multiUserNumbers) ? multiUserNumbers : multiUserNumbers.split(';').map(item => item.split(' '));
  multiUserList.forEach(userNumbers => {
    const currentResult = checkLottery(type, lotteryList, userNumbers);
    currentResult.prize > 0 && result.push(currentResult);
  });
  return result;
};

/**
 * 顺序生成
 * @param {*} count
 */
export const createSequenceLottery = (() => {
  const balls: Record<string, { frontBalls: string[]; backBalls: string[] }> = {};
  return (type: string) => {
    !balls[type] && (balls[type] = { frontBalls: [], backBalls: [] });
    const { frontBalls, backBalls } = balls[type];
    let result = [];
    switch (type) {
      case 'sp':
        frontBalls.length < 5 && frontBalls.push(...shuffleArray(createBallsPool(35, 1)));
        backBalls.length < 2 && backBalls.push(...shuffleArray(createBallsPool(12, 1)));
        result = [...getRandomNumbers(frontBalls, 5, true), ...getRandomNumbers(backBalls, 2, true)];
        break;
      case 'wf':
        frontBalls.length < 6 && frontBalls.splice(0, frontBalls.length) && frontBalls.push(...shuffleArray(createBallsPool(33, 1)));
        backBalls.length < 1 && backBalls.push(...shuffleArray(createBallsPool(16, 1)));
        result = [...getRandomNumbers(frontBalls, 6, true), ...getRandomNumbers(backBalls, 1, true)];
        break;
      default:
        throw new Error('Lottery Type 异常');
    }
    return result;
  };
})();

/**
 * 随机
 * @param {*} count
 */
export const createRandomLottery = (type: string) => {
  let result = [];
  switch (type) {
    case 'sp':
      result = [...getRandomNumbers(createBallsPool(35, 1), 5), ...getRandomNumbers(createBallsPool(12, 1), 2)];
      break;
    case 'wf':
      result = [...getRandomNumbers(createBallsPool(33, 1), 6), ...getRandomNumbers(createBallsPool(16, 1), 1)];
      break;
    default:
      throw new Error('Lottery Type 异常');
  }
  return result;
};

/**
 * 生成
 * @param {*} count
 */
export const createLottery = (option?: number | { count: number; type?: string; sequence?: boolean }) => {
  const { count = 1, type = 'sp', sequence = false } = (typeof option === 'number' ? { count: option } : option) || {};
  const result = [];
  // 继续 投注
  while (count > result.length) {
    result.push((sequence ? createSequenceLottery(type) : createRandomLottery(type)).join(' '));
  }
  return result;
};

export const computeStatVariance = (list: Array<Array<string>>) => {
  const itemCount = list[0].length;
  // 计算每个号码的期望和方差
  const expectationMap = {};
  const varianceMap = {};
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list[i].length; j++) {
      const ball = list[i][j];
      expectationMap[ball] = expectationMap[ball] ? expectationMap[ball] + 1 : 1;
    }
  }
  const total = list.length * itemCount;
  Object.keys(expectationMap).forEach(ball => {
    expectationMap[ball] = expectationMap[ball] / total;
  });

  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list[i].length; j++) {
      const ball = list[i][j];
      const diff = expectationMap[ball] - 1 / 35;
      varianceMap[ball] = varianceMap[ball] ? varianceMap[ball] + diff * diff : diff * diff;
    }
  }

  Object.keys(varianceMap).forEach(ball => {
    varianceMap[ball] = {
      variance: varianceMap[ball],
      expectation: expectationMap[ball]
    };
  });

  return varianceMap;
};

/**
 * 根据统计获取最佳号码
 * @param frontStat
 * @param backStat
 * @returns
 */
export const getRandomNumbersByStat = (frontStat: any, backStat: any) => {
  const rf: Array<string> = [];
  const rb: Array<string> = [];
  // 差值绝对值最小
  frontStat.sort((a: any, b: any) => a.gran - b.gran);
  rf.push(
    ...getRandomNumbers(
      frontStat.slice(0, 4).map(item => item.ball),
      2
    )
  );
  // 连续漏期最多
  frontStat.sort((a: any, b: any) => b.vanish - a.vanish);
  rf.push(
    ...getRandomNumbers(
      frontStat
        .filter(item => !rf.includes(item.ball))
        .slice(0, 4)
        .map(item => item.ball),
      2
    )
  );
  // 和值越大，概率越高
  frontStat.sort((a: any, b: any) => b.sum - a.sum);
  rf.push(
    ...getRandomNumbers(
      frontStat
        .filter(item => !rf.includes(item.ball))
        .slice(0, 2)
        .map(item => item.ball),
      1
    )
  );
  backStat.sort((a: any, b: any) => b.vanish - a.vanish);
  rb.push(
    ...getRandomNumbers(
      backStat.slice(0, 2).map(item => item.ball),
      1
    )
  );
  backStat.sort((a: any, b: any) => a.sum - b.sum);
  rb.push(
    ...getRandomNumbers(
      backStat
        .filter(item => !rb.includes(item.ball))
        .slice(0, 2)
        .map(item => item.ball),
      1
    )
  );
  rf.sort((a, b) => parseInt(a) - parseInt(b));
  rb.sort((a, b) => parseInt(a) - parseInt(b));
  return [...rf, ...rb];
};

/**
 * 通过期望方差获取最佳号码
 * @returns
 */
export const getRandomNumbersByVariance = (frontStat: any, backStat: any) => {
  const vf: Array<string> = [];
  const vb: Array<string> = [];
  frontStat.sort((a: any, b: any) => b.expectation - a.expectation);
  // 4选2
  vf.push(
    ...getRandomNumbers(
      frontStat.slice(0, 4).map((item: any) => item.ball),
      2
    )
  );
  frontStat.sort((a: any, b: any) => a.variance - b.variance);
  // 6选3
  vf.push(
    ...getRandomNumbers(
      frontStat
        .filter((item: any) => !vf.includes(item.ball))
        .slice(0, 6)
        .map((item: any) => item.ball),
      3
    )
  );

  backStat.sort((a: any, b: any) => b.expectation - a.expectation);
  // 2选1
  vb.push(
    ...getRandomNumbers(
      backStat.slice(0, 2).map((item: any) => item.ball),
      1
    )
  );
  backStat.sort((a: any, b: any) => a.variance - b.variance);
  // 2选1
  vb.push(
    ...getRandomNumbers(
      backStat
        .filter((item: any) => !vb.includes(item.ball))
        .slice(0, 2)
        .map((item: any) => item.ball),
      1
    )
  );
  vf.sort((a, b) => parseInt(a) - parseInt(b));
  vb.sort((a, b) => parseInt(a) - parseInt(b));
  return [...vf, ...vb];
};
