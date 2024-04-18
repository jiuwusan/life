import { ApiGenerator } from '@/utils/fetch';
import { isServer } from '@/utils/util';

export type ResponseResult = {
  code: number;
  msg: string;
  data: Record<string, any> | null;
};

const APIV1 = new ApiGenerator({
  baseUrl: isServer() ? 'https://jiuwusan.cn/life-api' : '/life-api',
  // baseUrl: isServer() ? 'http://localhost:9000' : '/life-api',
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
  // 投注
  bet: (data: { uid?: string; type?: string }) => APIV1.fetch('lottery/bet', { method: 'POST', data })
};
