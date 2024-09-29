type Prize = { grade: number; gradeCn?: string; amount: number };

/**
 * 获取等级
 */
export const getPrize = (frontHits: number, backHits: number) => {
  const nullPrize: Prize = { grade: 99, amount: 0 };
  const prizes: Prize[][] = Array.from({ length: 6 }, () => Array(3).fill(nullPrize));
  prizes[5][2] = { grade: 1, amount: 10000000 };
  prizes[5][1] = { grade: 2, amount: 300000 };
  prizes[5][0] = { grade: 3, amount: 10000 };
  prizes[4][2] = { grade: 4, amount: 3000 };
  prizes[4][1] = { grade: 5, amount: 300 };
  prizes[3][2] = { grade: 6, amount: 200 };
  prizes[4][0] = { grade: 7, amount: 100 };
  prizes[2][2] = { grade: 8, amount: 10 };
  prizes[3][1] = prizes[2][2];
  prizes[0][2] = { grade: 9, amount: 5 };
  prizes[1][2] = prizes[0][2];
  prizes[2][1] = prizes[0][2];
  const prize = prizes[frontHits][backHits] || nullPrize;
  const numMaps = '零一二三四五六七八九'.split('');
  prize.gradeCn = prize.grade < 99 ? `${numMaps[prize.grade]}等奖` : '未中奖';
  return prize;
};

/**
 * 验奖
 * @param lotteryNumbers
 * @param userNumbers
 * @returns
 */
export const checkLottery = (lotteryNumbers: Array<string>, userNumbers: Array<string>) => {
  if (!lotteryNumbers || !userNumbers) {
    return {
      grade: 99,
      amount: 0,
      frontHits: '无',
      backHits: '无',
      gradeCn: '未中奖'
    };
  }
  const frontNumbers = lotteryNumbers.slice(0, 5);
  const backNumbers = lotteryNumbers.slice(-2);
  const userFrontNumbers = userNumbers.slice(0, 5);
  const userBackNumbers = userNumbers.slice(-2);

  const frontHits = [];
  const backHits = [];

  // 检查前区中奖号码
  userFrontNumbers.forEach(function (num) {
    const currNum = (String(num).length <= 1 ? '0' : '') + num;
    if (frontNumbers.indexOf(currNum) != -1) {
      frontHits.push(currNum);
    }
  });

  // 检查后区中奖号码
  userBackNumbers.forEach(function (num) {
    const currNum = (String(num).length <= 1 ? '0' : '') + num;
    if (backNumbers.indexOf(currNum) != -1) {
      backHits.push(currNum);
    }
  });
  const winHits = [].concat(frontHits).concat(['+']).concat(backHits);
  const prize = getPrize(frontHits.length, backHits.length);

  return {
    ...prize,
    front: frontHits.join(' '),
    back: backHits.join(' '),
    win: winHits.join(' ')
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
export const batchCheckLottery = (lotteryNumbers: Array<string> | string, multiUserNumbers: Array<Array<string>> | string, onlyWin?: boolean) => {
  const result = [];
  // 将字符串转换为数组
  const lotteryList = Array.isArray(lotteryNumbers) ? lotteryNumbers : lotteryNumbers.split(' ');
  const multiUserList = Array.isArray(multiUserNumbers) ? multiUserNumbers : multiUserNumbers.split(';').map(item => item.split(' '));
  multiUserList.forEach(userNumbers => {
    const currentResult = checkLottery(lotteryList, userNumbers);
    if (!onlyWin) {
      return result.push(currentResult);
    }
    currentResult.grade < 99 && result.push(currentResult);
  });
  return result;
};

/**
 * 顺序生成
 * @param {*} count
 */
export const createSequenceLottery = (() => {
  const frontBalls = [];
  const backBalls = [];
  return () => {
    frontBalls.length < 5 && frontBalls.push(...shuffleArray(createBallsPool(35, 1)));
    backBalls.length < 2 && backBalls.push(...shuffleArray(createBallsPool(12, 1)));
    return [...getRandomNumbers(frontBalls, 5, true), ...getRandomNumbers(backBalls, 2, true)];
  };
})();

/**
 * 随机
 * @param {*} count
 */
export const createRandomLottery = () => {
  return [...getRandomNumbers(createBallsPool(35, 1), 5), ...getRandomNumbers(createBallsPool(12, 1), 2)];
};

/**
 * 生成
 * @param {*} count
 */
export const createLottery = (count: number, sequence?: boolean) => {
  const result = [];
  typeof count !== 'number' && (count = 1);
  // 继续 投注
  while (count > result.length) {
    result.push((sequence ? createSequenceLottery() : createRandomLottery()).join(' '));
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
