import { ApiGenerator } from '@/utils/fetch';
import { isServer } from '@/utils/util';

export type ResponseResult = {
  code: number;
  msg: string;
  data: Record<string, any> | null;
};

const { LIFE_SERVER_API = 'http://127.0.0.1:9000' } = process.env;

const APIV1 = new ApiGenerator({
  baseUrl: isServer() ? LIFE_SERVER_API : '/life-api',
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

export const authApi = {
  // 验证 token
  verifyToken: (data: { token: string }) => APIV1.fetch('auth/verify/token', { data })
};
