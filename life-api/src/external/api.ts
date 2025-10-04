import { ApiGenerator, type Params, type RequestOptions } from '@/utils/fetch';
import config from '@/config';

// 环境变量
const { CLASH_SUB_LInk, CLASH_SUB_TOKEN, DINGDING_WEBHOOK_TOKEN, WX_WEBHOOK_TOKEN } = config;

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
  queryWfLotteryHistory: (query?: Params, options?: RequestOptions) =>
    WFAPI.fetch('/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice', { query, redirect: 'manual', ...(options || {}) })
};

// QBittorrent API
const QBitAPI = new ApiGenerator({
  baseUrl: '/api/v2',
  formatFetchURL: async (url, options: RequestOptions) => {
    return options.baseUrl + url;
  },
  formatFetchOptions: async (options: RequestOptions) => {
    if (options.data) {
      options.body = new URLSearchParams(options.data);
      delete options.data;
    }
    console.log('formatFetchOptions:', options);
    return options;
  },
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

// 钉钉 API
const DingDingAPI = new ApiGenerator({
  baseUrl: 'https://oapi.dingtalk.com',
  formatFetchOptions: async (options: RequestOptions) => {
    options.headers = {
      'Content-Type': 'application/json;charset=utf-8'
    };
    (options.query ??= {}).access_token ??= DINGDING_WEBHOOK_TOKEN;
    return options;
  }
});

// 企业微信 API
const WorkWxAPI = new ApiGenerator({
  baseUrl: 'https://qyapi.weixin.qq.com',
  formatFetchOptions: async (options: RequestOptions) => {
    options.headers = {
      'Content-Type': 'application/json;charset=utf-8'
    };
    (options.query ??= {}).key ??= WX_WEBHOOK_TOKEN;
    return options;
  }
});

export const webHookApi = {
  // 发送钉钉消息
  sendDingMessage: (data?: Params) => DingDingAPI.fetch('/robot/send', { method: 'POST', data }),
  // 发送企业微信消息
  sendWxMessage: (data?: Params) => WorkWxAPI.fetch('/cgi-bin/webhook/send', { method: 'POST', data })
};

// 阿里云函数 API
const AliSubAPI = new ApiGenerator({
  baseUrl: CLASH_SUB_LInk,
  formatFetchOptions: async (options: RequestOptions) => {
    options.headers = {
      'Content-Type': 'application/json;charset=utf-8'
    };
    (options.query ??= {}).authcode ??= CLASH_SUB_TOKEN;
    return options;
  },
  formatResponse: async (response: Response) => {
    return await response.json();
  }
});

export const subApi = {
  // 更新订阅
  update: () => AliSubAPI.fetch('sub/api/oss/update')
};
