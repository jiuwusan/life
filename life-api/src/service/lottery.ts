import { Injectable } from '@nestjs/common';

type Prize = { grade: number; gradeCn?: string; amount: number };

/**
 * 获取等级
 */
export const getPrize = (frontHits: number, backHits: number) => {
  const prizes: Prize[][] = [[]];
  prizes[5][2] = { grade: 1, amount: 1000 };
  prizes[5][1] = { grade: 2, amount: 3000 };
  prizes[5][0] = { grade: 3, amount: 3000 };
  prizes[4][2] = { grade: 4, amount: 3000 };
  prizes[4][1] = { grade: 5, amount: 3000 };
  prizes[3][2] = { grade: 6, amount: 3000 };
  prizes[4][0] = { grade: 7, amount: 3000 };
  prizes[2][2] = prizes[3][1] = prizes[1][3] = { grade: 8, amount: 15 };
  prizes[0][2] = prizes[1][2] = prizes[2][1] = { grade: 9, amount: 5 };
  return prizes[frontHits][backHits] || { grade: 99, amount: 0 };
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
      prize: getPrize(0, 0),
      frontHits: '无',
      backHits: '无'
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
  const numMaps = '零一二三四五六七八九'.split('');
  let prizeCn = '未中奖';
  prize.grade < 99 && (prizeCn = `${numMaps[prize.grade]}等奖`);

  return {
    prizeCn,
    prize: prize,
    frontHits: frontHits.join(' ') || '无',
    backHits: backHits.join(' ') || '无',
    winHits: winHits.join(' ')
  };
};

/**
 * 创建池
 */
const createLottterys = (max = 0, min = 1) => {
  const value = [];

  for (let index = min; index <= max; index++) {
    value.push(index);
  }

  return value;
};

/**
 * 确保每个元素都有相等的概率被选中
 *
 * @param {*} array
 * @returns
 */
const shuffleArray = (array, depth = 1) => {
  // 防止浅克隆
  const sliceArray = array.slice();
  for (let i = sliceArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sliceArray[i], sliceArray[j]] = [sliceArray[j], sliceArray[i]];
  }

  if (depth == 1) {
    return sliceArray;
  }

  return shuffleArray(sliceArray, --depth);
};

/**
 * 获取随机串
 *
 * @param {*} max
 * @param {*} num
 */
const getRandomNumbers = (bets, count) => {
  const shuffled = shuffleArray(bets, 1996); // 洗牌
  // jws.log('shuffled-->', shuffled)
  const result = shuffled.slice(0, count); // 取前 count 个数
  // 正序排列
  result.sort((a, b) => a - b);
  return result.map(item => {
    return (item < 10 ? '0' : '') + String(item);
  });
};

/**
 * 批量验奖
 * @param lotteryNumbers
 * @param multiUserNumbers
 * @returns
 */
export const batchCheckLottery = (lotteryNumbers: Array<string>, multiUserNumbers: Array<Array<string>>) => {
  const result = [];
  multiUserNumbers.forEach(userNumbers => {
    const currentResult = checkLottery(lotteryNumbers, userNumbers);
    result.push(currentResult);
  });
  return result;
};

/**
 * 生成
 * @param {*} count
 */
export const createLottery = (count: number) => {
  const result = [];
  // 继续 投注
  while ((count || 1) > result.length) {
    const currentLottery = []
      .concat(getRandomNumbers(createLottterys(35), 5))
      .concat(getRandomNumbers(createLottterys(12), 2));
    result.push(currentLottery);
  }

  return result;
};

@Injectable()
export default class LotteryService {
  create(count: number) {
    return createLottery(count);
  }

  /**
   * 批量验奖
   * @param lotteryNumbers
   * @param multiUserNumbers
   * @returns
   */
  verify(lotteryNumbers: Array<string>, multiUserNumbers: Array<Array<string>>) {
    return batchCheckLottery(lotteryNumbers, multiUserNumbers);
  }
}
