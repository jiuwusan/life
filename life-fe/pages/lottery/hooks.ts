import { lotteryApi } from '@/api';
import { formatDateToStr, strToArray } from '@/utils/util';

// 列表
export const queryLotteryList = async (query?: { pageNo: number }) => {
  const result = (await lotteryApi.querylist(query)) || { list: [] };
  return (result.list || []).map((item: any) => ({
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

export const matchLottery = (userBalls: string, winBalls?: string) => {
  const bets = strToArray(userBalls);
  const wins = strToArray(winBalls);
  if (!winBalls) {
    return bets.map(item => ({ value: item, isMatch: false }));
  }
  const frontNumbers = wins.slice(0, 5);
  const backNumbers = wins.slice(-2);

  return bets.map((item, index) => ({
    value: item,
    isMatch: index < 5 ? frontNumbers.includes(item) : backNumbers.includes(item)
  }));
};
