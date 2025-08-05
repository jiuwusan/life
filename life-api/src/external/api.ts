import { ApiGenerator, type Params, type RequestOptions } from '@/utils/fetch';

// 体彩 API
const STAPI = new ApiGenerator({
  baseUrl: 'https://webapi.sporttery.cn',
  formatResponse: async (response: Response) => {
    try {
      const result = await response.json();
      if (['0'].includes(result.errorCode)) {
        return result.value;
      }
    } catch (error) {
      console.error('STAPI Failed to fetch data:', error);
    }
    return response;
  }
});

// 福彩 API
const WFAPI = new ApiGenerator({
  baseUrl: 'https://www.cwl.gov.cn',
  formatFetchOptions: async (options: RequestOptions) => {
    options.headers = {
      ...(options.headers || {}),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
    };
    return options;
  },
  formatResponse: async (response: Response) => {
    try {
      const result = await response.json();
      const newCookies = response.headers.get('set-cookie');
      newCookies && (result.newCookies = newCookies.split('; ')[0]);
      if ([0].includes(result.state)) {
        return result;
      }
    } catch (error) {
      console.error('WFAPI Failed to fetch data:', error);
    }
    return response;
  }
});

export const lotteryApi = {
  // 查询 大乐透列表
  querySpLotteryHistory: (query?: Params) => STAPI.fetch('/gateway/lottery/getHistoryPageListV1.qry', { query }),
  // 查询 双色球列表
  queryWfLotteryHistory: (query?: Params, options?: RequestOptions) => WFAPI.fetch('/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice', { query, redirect: 'manual', ...(options || {}) })
};

// QBittorrent API
const QBitAPI = new ApiGenerator({
  baseUrl: 'http://qbittorrent:8080/api/v2',
  // baseUrl: 'https://cloud.jiuwusan.cn:36443/api/v2',
  formatResponse: async (response: Response) => {
    if (response?.status !== 200) {
      throw response;
    }
    try {
      return await response.json();
    } catch (error) {
      console.error('QBitAPI Failed to fetch data:', error);
    }
    return response;
  },
  formatFetchOptions: async (options: RequestOptions) => {
    if (options.data) {
      const formData = new URLSearchParams();
      Object.keys(options.data).forEach((keyStr: string) => formData.append(keyStr, options.data[keyStr]));
      options.body = formData;
      delete options.data;
    }
    return options;
  }
});

export const qbApi = {
  // 登录
  login: (data?: Params) => QBitAPI.fetch('/auth/login', { method: 'POST', data }),
  // 查询列表
  queryTorrentsInfo: (option?: Params) => QBitAPI.fetch('/torrents/info', option),
  // 查询种子文件列表
  queryTorrentFiles: (option?: Params) => QBitAPI.fetch('/torrents/files', option),
  // 重命名文件名称
  updateTorrentFileName: (option?: Params) => QBitAPI.fetch('/torrents/renameFile', { method: 'POST', ...(option || {}) })
};

// DINGTALK_WEBHOOK="https://oapi.dingtalk.com/robot/send?access_token=f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997"
// DingDing API
const DingDingAPI = new ApiGenerator({
  baseUrl: 'https://oapi.dingtalk.com'
});

export const webHookApi = {
  // 登录
  sendMessage: (data?: Params) => DingDingAPI.fetch('/robot/send', { method: 'POST', query: { access_token: 'f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997' }, data })
};
