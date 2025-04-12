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
      console.error('Failed to fetch data:', error);
    }
    return response;
  }
});

// 福彩 API
const WFAPI = (() => {
  let WFACookie = 'HMF_CI=74678a4235c1ee6b181231bf4390fe47df1756c6289a4eca8cd291250499cb387f8376e288be8dd4c1b5b8ef77d53bde38f0afe0227a4f18585dc4791875617eb3';
  return new ApiGenerator({
    baseUrl: 'https://www.cwl.gov.cn',
    formatFetchOptions: async (options: RequestOptions) => {
      console.log('formatFetchOptions：', options);
      options.headers = {
        ...(options.headers || {}),
        cookie: WFACookie
      };
      return options;
    },
    formatResponse: async (response: Response) => {
      try {
        const cookies = response.headers.get('set-cookie');
        cookies && (WFACookie = cookies);
        const result = await response.json();
        if ([0].includes(result.state)) {
          return result;
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      return response;
    }
  });
})()

export const lotteryApi = {
  // 查询列表
  querySpLotteryHistory: (query?: Params) => STAPI.fetch('gateway/lottery/getHistoryPageListV1.qry', { query }),
  // https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&pageNo=1&pageSize=30&systemType=PC
  queryWfLotteryHistory: (query?: Params) =>
    WFAPI.fetch('cwl_admin/front/cwlkj/search/kjxx/findDrawNotice', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        Referer: 'https://www.cwl.gov.cn'
      },
      query
    })
};

// QBittorrent API
const QBitAPI = new ApiGenerator({
  baseUrl: 'http://10.16.0.236:8080/api/v2',
  // baseUrl: 'https://cloud.jiuwusan.cn:36443/api/v2',
  formatResponse: async (response: Response) => {
    try {
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
