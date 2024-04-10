import request from '@/utils/request';

export default {
  queryLotteryHistory: query =>
    request('https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry', { query })
};
