const jws = {
    log: (...args) => {
        args = args.map((item) => {
            if (item !== undefined && typeof item === 'object') {
                return JSON.stringify(item)
            }
            return item
        })
        console.log(...args)
    }
}

function getPrize(frontHits, backHits) {
    if (frontHits == 5 && backHits == 2) {
        return 1;
    } else if (frontHits == 5 && backHits == 1) {
        return 2;
    } else if (frontHits == 5 && backHits == 0) {
        return 3;
    } else if (frontHits == 4 && backHits == 2) {
        return 4;
    } else if (frontHits == 4 && backHits == 1) {
        return 5;
    } else if (frontHits == 3 && backHits == 2) {
        return 6;
    } else if (frontHits == 4 && backHits == 0) {
        return 7;
    } else if ((frontHits + backHits) == 4) {
        return 8;
    } else if (((frontHits + backHits) == 3) || (frontHits == 0 && backHits == 2)) {
        return 9;
    } else {
        return 99;
    }
}

function checkLottery(lotteryNumbers, userNumbers) {
    if (!lotteryNumbers || !userNumbers) {
        return {
            prize: getPrize(0, 0),
            frontHits: '无',
            backHits: '无'
        };
    }
    var frontNumbers = lotteryNumbers.slice(0, 5)
    var backNumbers = lotteryNumbers.slice(-2)
    var userFrontNumbers = userNumbers.slice(0, 5)
    var userBackNumbers = userNumbers.slice(-2)

    var frontHits = [];
    var backHits = [];

    // 检查前区中奖号码
    userFrontNumbers.forEach(function (num) {
        var currNum = (String(num).length <= 1 ? '0' : '') + num
        if (frontNumbers.indexOf(currNum) != -1) {
            frontHits.push(currNum)
        }
    });

    // 检查后区中奖号码
    userBackNumbers.forEach(function (num) {
        var currNum = (String(num).length <= 1 ? '0' : '') + num
        if (backNumbers.indexOf(currNum) != -1) {
            backHits.push(currNum)
        }
    });
    var winHits = [].concat(frontHits).concat(['+']).concat(backHits)
    const prize = getPrize(frontHits.length, backHits.length)
    const numMaps = ('零一二三四五六七八九').split('');
    prizeCn = '未中奖'
    prize < 99 && (prizeCn = `${numMaps[prize]}等奖`);

    return {
        prizeCn,
        prize: prize,
        frontHits: frontHits.join(' ') || '无',
        backHits: backHits.join(' ') || '无',
        winHits: winHits.join(' ')
    };
}


function batchCheckLottery(lotteryNumbers, multiUserNumbers) {
    const result = []
    multiUserNumbers.forEach(userNumbers => {
        var currentResult = checkLottery(lotteryNumbers, userNumbers)
        result.push(currentResult)
    });
    return result
}

/**
 * 创建池
 */
function createLottterys(max = 0, min = 1) {
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
function shuffleArray(array, depth = 1) {
    const sliceArray = array.slice()
    for (let i = sliceArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [sliceArray[i], sliceArray[j]] = [sliceArray[j], sliceArray[i]];
    }

    if (depth == 1) {
        return sliceArray;
    }

    // jws.log(sliceArray)
    return shuffleArray(sliceArray, --depth)
}



/**
 * 获取随机串
 * 
 * @param {*} max 
 * @param {*} num 
 */
function getRandomNumbers(bets, count) {
    const shuffled = shuffleArray(bets, 1996); // 洗牌
    // jws.log('shuffled-->', shuffled)
    const result = shuffled.slice(0, count); // 取前 count 个数
    // 正序排列
    result.sort((a, b) => a - b)
    return result.map((item) => {
        return (item < 10 ? '0' : '') + String(item)
    })
}

/**
 * 生成
 * @param {*} count 
 */
function createLottery(count = 1) {
    const result = []
    // 继续 投注
    while (count > result.length) {
        const curentLottery = [].concat(getRandomNumbers(createLottterys(35), 5)).concat(getRandomNumbers(createLottterys(12), 2));
        // jws.log(curentLottery);
        result.push(curentLottery);
    }

    return result
}

const getTargetLotterys = () => {
    let matchResult
    let matchCount = 0

    while (!matchResult) {
        matchCount++;
        const winLottery = createLottery()[0];
        const userLottery = createLottery(5);
        const checkResult = batchCheckLottery(winLottery, userLottery);
        jws.log(`第${matchCount}次：`, userLottery)
        matchResult = checkResult.find((item => item.prize < 2));
    }

    return { matchCount, matchResult }
}

const simulateLotterys = (count = 1) => {
    let result = []

    while (result.length < count) {
        result.push(getTargetLotterys())
    }
    jws.log(result.map((item, index) => `第${index + 1}组：消耗->${item.matchCount}次，${item.matchResult.winHits}`).join('\n'))
    jws.log(`共消耗次：${result.reduce((sum, item) => sum + item.matchCount, 0)}`)
}

simulateLotterys(5)
