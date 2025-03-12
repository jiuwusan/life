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

// 福彩 API
const WFAPI = new ApiGenerator({
  baseUrl: 'https://www.cwl.gov.cn',
  formatResponse: res => {
    console.log('res--->', res);
    if ([0].includes(res.state)) {
      return res;
    }
    return void 0;
  }
});

export const lotteryApi = {
  // 查询列表
  querySpLotteryHistory: (query?: Params) => STAPI.fetch('gateway/lottery/getHistoryPageListV1.qry', { query }),
  // https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&pageNo=1&pageSize=30&systemType=PC
  queryWfLotteryHistory: (query?: Params) =>
    WFAPI.fetch('cwl_admin/front/cwlkj/search/kjxx/findDrawNotice', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        Accept: 'application/json',
        Cookie: 'HMF_CI=45f2f101808a68eefbc54b4e4e436d3474870a16377adc58010a5225f74baa3081328c7be17de54f422c22bd370799bdd749ff6d7edb395fd8eceef4af2adc0c1c'
      },
      query
    })
};

// QBittorrent API
const QBitAPI = new ApiGenerator({
  baseUrl: 'http://10.16.0.236:8080/api/v2',
  // baseUrl: 'https://cloud.jiuwusan.cn:36443/api/v2',
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
