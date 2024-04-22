import { lotteryApi } from '@/api';
import { formatDateToStr } from '@/utils/util';

// 列表
export const queryLotteryList = async (query?: { pageNo: number }) => {
  const list = (await lotteryApi.querylist(query)) || [];
  return list.map((item: any) => ({
    ...item,
    betTime: formatDateToStr(item.betTime),
    winTime: item.winTime && formatDateToStr(item.winTime)
  }));
};

// 统计数据
export const getStatistics = async () => {
  const result = await lotteryApi.statistics();
  return result || { frontStat: [], backStat: [] };
};

export const betLottery = async (formData?: { type?: string; uid?: string }) => {
  const result = await lotteryApi.bet(formData);
  return result;
};

export const matchLottery = (userBalls: Array<string>, winBalls?: Array<string>) => {
  if (!winBalls) {
    return userBalls.map(item => ({ value: item, isMatch: false }));
  }
  const frontNumbers = winBalls.slice(0, 5);
  const backNumbers = winBalls.slice(-2);

  return userBalls.map((item, index) => {
    return {
      value: item,
      isMatch: index < 5 ? frontNumbers.includes(item) : backNumbers.includes(item)
    };
  });
};
