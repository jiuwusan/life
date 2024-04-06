/**
 * 获取奖等级
 */
export const getPrize = (frontHits: number, backHits: number) => {
  if (frontHits === 5 && backHits === 2) {
    return 1
  } else if (frontHits === 5 && backHits === 1) {
    return 2
  } else if (frontHits === 5 && backHits === 0) {
    return 3
  } else if (frontHits === 4 && backHits === 2) {
    return 4
  } else if (frontHits === 4 && backHits === 1) {
    return 5
  } else if (frontHits === 3 && backHits === 2) {
    return 6
  } else if (frontHits === 4 && backHits === 0) {
    return 7
  } else if (frontHits + backHits === 4) {
    return 8
  } else if (frontHits + backHits === 3 || (frontHits === 0 && backHits === 2)) {
    return 9
  } else {
    return 99
  }
}

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
    }
  }
  const frontNumbers = lotteryNumbers.slice(0, 5)
  const backNumbers = lotteryNumbers.slice(-2)
  const userFrontNumbers = userNumbers.slice(0, 5)
  const userBackNumbers = userNumbers.slice(-2)

  const frontHits = []
  const backHits = []

  // 检查前区中奖号码
  userFrontNumbers.forEach(function (num) {
    const currNum = (String(num).length <= 1 ? '0' : '') + num
    if (frontNumbers.indexOf(currNum) != -1) {
      frontHits.push(currNum)
    }
  })

  // 检查后区中奖号码
  userBackNumbers.forEach(function (num) {
    const currNum = (String(num).length <= 1 ? '0' : '') + num
    if (backNumbers.indexOf(currNum) != -1) {
      backHits.push(currNum)
    }
  })
  const winHits = [].concat(frontHits).concat(['+']).concat(backHits)
  const prize = getPrize(frontHits.length, backHits.length)
  const numMaps = '零一二三四五六七八九'.split('')
  let prizeCn = '未中奖'
  prize < 99 && (prizeCn = `${numMaps[prize]}等奖`)

  return {
    prizeCn,
    prize: prize,
    frontHits: frontHits.join(' ') || '无',
    backHits: backHits.join(' ') || '无',
    winHits: winHits.join(' ')
  }
}

/**
 * 批量验奖
 * @param lotteryNumbers
 * @param multiUserNumbers
 * @returns
 */
export const batchCheckLottery = (lotteryNumbers: Array<string>, multiUserNumbers: Array<Array<string>>) => {
  const result = []
  multiUserNumbers.forEach(userNumbers => {
    const currentResult = checkLottery(lotteryNumbers, userNumbers)
    result.push(currentResult)
  })
  return result
}

/**
 * 创建池
 */
const createLottterys = (max = 0, min = 1) => {
  const value = []

  for (let index = min; index <= max; index++) {
    value.push(index)
  }

  return value
}

/**
 * 确保每个元素都有相等的概率被选中
 *
 * @param {*} array
 * @returns
 */
const shuffleArray = (array, depth = 1) => {
  // 防止浅克隆
  const sliceArray = array.slice()
  for (let i = sliceArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[sliceArray[i], sliceArray[j]] = [sliceArray[j], sliceArray[i]]
  }

  if (depth == 1) {
    return sliceArray
  }

  return shuffleArray(sliceArray, --depth)
}

/**
 * 获取随机串
 *
 * @param {*} max
 * @param {*} num
 */
const getRandomNumbers = (bets, count) => {
  const shuffled = shuffleArray(bets, 1996) // 洗牌
  // jws.log('shuffled-->', shuffled)
  const result = shuffled.slice(0, count) // 取前 count 个数
  // 正序排列
  result.sort((a, b) => a - b)
  return result.map(item => {
    return (item < 10 ? '0' : '') + String(item)
  })
}

/**
 * 生成
 * @param {*} count
 */
export const createLottery = (count: number) => {
  const result = []
  // 继续 投注
  while ((count || 1) > result.length) {
    const currentLottery = []
      .concat(getRandomNumbers(createLottterys(35), 5))
      .concat(getRandomNumbers(createLottterys(12), 2))
    result.push(currentLottery)
  }

  return result
}
