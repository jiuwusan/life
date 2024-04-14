import { lotteryApi } from '@/api';
import { formatDateToStr } from '@/utils/util';

export const queryLotteryList = async (query?: { pageNo: number }) => {
  const list = (await lotteryApi.querylist(query)) || [];
  return list.map((item: any) => ({
    ...item,
    betTime: formatDateToStr(item.betTime),
    winTime: item.winTime && formatDateToStr(item.winTime)
  }));
};
