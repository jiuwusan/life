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

// QBittorrent API
const QBitAPI = new ApiGenerator({
  baseUrl: 'https://cloud.jiuwusan.cn:36443/api/v2',
  formatResponse: res => {
    return res;
  },
  formatFetchOptions: options => {
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
