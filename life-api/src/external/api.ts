import request from '@/utils/request';

export default {
  queryLotteryHistory: query =>
    request(
      'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=100&isVerify=1&pageNo=1',
      {
        query
      }
    )
};
