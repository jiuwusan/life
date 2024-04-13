import { ApiGenerator, type Params } from '@/utils/fetch';

// 体彩 API
const STAPI = new ApiGenerator({
  baseUrl: 'https://webapi.sporttery.cn',
  formatResponse: res => {
    if (['0'].includes(res.errorCode)) {
      return res.value;
    }
    return void 0;
  }
});

export const lotteryApi = {
  // 查询列表
  queryLotteryHistory: (query?: Params) => STAPI.fetch('gateway/lottery/getHistoryPageListV1.qry', { query })
};
