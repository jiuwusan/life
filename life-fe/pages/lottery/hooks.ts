import { lotteryApi } from '@/api';
import { formatDateToStr, strToArray } from '@/utils/util';

export const LotteryMaps: Record<string, { front: number[]; back: number; name: string; backColor: string }> = {
  sp: {
    front: [0, 5],
    back: -2,
    backColor: 'yellow',
    name: '超级大乐透'
  },
  wf: {
    front: [0, 6],
    back: -1,
    backColor: 'red',
    name: '双色球'
  }
};

// 列表
export const queryLotteryList = async (query?: { pageNo: number; pageSize?: number }) => {
  const { list = [], total = 0 } = (await lotteryApi.querylist(query)) || { list: [], total: 0 };
  return {
    total,
    list: list.map((item: any) => ({
      ...item,
      betTime: formatDateToStr(item.betTime),
      winTime: item.winTime && formatDateToStr(item.winTime)
    }))
  };
};

// 统计数据
export const getStatistics = async () => {
  const result = await lotteryApi.statistics();
  return result || { frontStat: [], backStat: [] };
};

// 选号
export const betLottery = async (formData?: { type?: string; uid?: string }) => {
  const result = await lotteryApi.bet(formData);
  return result;
};

// 移除
export const removeLottery = async (uid: string) => {
  const result = await lotteryApi.remove({ uid });
  return result;
};

export const matchLottery = (type: string, userBalls: string, winBalls?: string): { value: string; color: string; matched?: boolean }[] => {
  const current = LotteryMaps[type];
  const userNumbers = strToArray(userBalls).map(item => ({ value: item, color: '' }));
  if (!current) {
    return userNumbers;
  }

  const userFrontNumbers = userNumbers.slice(...current.front);
  const userBackNumbers = userNumbers.slice(current.back).map(item => ({ ...item, color: current.backColor }));
  if (!winBalls) {
    return [...userFrontNumbers, ...userBackNumbers];
  }
  const lotteryNumbers = strToArray(winBalls);
  const frontNumbers = lotteryNumbers.slice(...current.front);
  const backNumbers = lotteryNumbers.slice(current.back);

  return [
    ...userFrontNumbers.map(item => ({ ...item, matched: frontNumbers.includes(item.value) })),
    ...userBackNumbers.map(item => ({ ...item, matched: backNumbers.includes(item.value) }))
  ];
};
