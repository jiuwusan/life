import { ApiGenerator } from '@/utils/fetch';
import { isServer } from '@/utils/util';

export type ResponseResult = {
  code: number;
  msg: string;
  data: Record<string, any> | null;
};

const APIV1 = new ApiGenerator({
  // baseUrl: isServer() ? 'http://nginx-gateway/life-api' : '/life-api',
  baseUrl: isServer() ? 'http://localhost:9000' : '/life-api',
  formatResponse: res => {
    if ([200].includes(res.code)) {
      return res.data;
    }
    return void 0;
  }
});

export const lotteryApi = {
  // 查询列表
  querylist: (query?: { pageNo?: number; pageSize?: number }) => APIV1.fetch('lottery/query/list', { query }),
  // 统计数据
  statistics: (query?: { pageNo?: number; pageSize?: number }) => APIV1.fetch('lottery/statistics', { query }),
  // 推荐号码
  recommend: (query?: { pageNo?: number; pageSize?: number }) => APIV1.fetch('lottery/query/recommend', { query }),
  // 投注
  bet: (data?: { uid?: string; type?: string }) => APIV1.fetch('lottery/bet', { method: 'POST', data }),
  // 投注
  remove: (data: { uid?: string }) => APIV1.fetch('lottery/remove', { method: 'POST', data })
};
