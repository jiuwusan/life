import { appendQueryParams, joinUrl } from '@/utils/util';

export type Params = Record<string, any>;

// 处理返回的数据
export type FormatResponse = (response: Params, options?: RequestOptions) => any;

// 格式化
export type FormatFetchOptions = (options: RequestOptions) => RequestOptions;

export type ApiGeneratorOptions = {
  baseUrl?: string;
  formatResponse?: FormatResponse;
  formatFetchOptions?: FormatFetchOptions;
};

export interface RequestOptions extends RequestInit {
  data?: Params;
  query?: Params;
  primitive?: boolean;
}

/**
 * 封装请求
 *
 * @param url
 * @param options
 * @returns
 */
export const request = (url: RequestInfo, options?: RequestOptions) => {
  let ACIDCount = 0;

  const ACIDREQ = async (url: RequestInfo, options?: RequestOptions): Promise<Response> => {
    ACIDCount++;
    try {
      if (options && typeof options === 'object') {
        options.query && typeof url === 'string' && (url = appendQueryParams(url, options.query));
        options.data && (options.body = JSON.stringify(options.data));
        delete options.query;
        delete options.data;
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (ACIDCount < 3) {
        console.error(`第 ${ACIDCount} 次尝试重连 --> ${url}`);
        return ACIDREQ(url, options);
      }
      throw error;
    }
  };

  return ACIDREQ(url, options);
};

export class ApiGenerator {
  // eslint-disable-next-line prettier/prettier
  private options: ApiGeneratorOptions = {};
  constructor(options?: string | ApiGeneratorOptions) {
    if (options) {
      switch (typeof options) {
        case 'object':
          this.options = options;
          break;
        case 'string':
          this.options = { baseUrl: options as string };
          break;
      }
    }
  }

  public async fetch(url: RequestInfo, options?: string | RequestOptions): Promise<any> {
    if (this.options?.baseUrl && typeof url === 'string' && !/^(https?:)?\/\//.test(url)) {
      url = joinUrl(this.options?.baseUrl, url);
    }
    !options && (options = 'GET');
    // 表示请求方法
    typeof options === 'string' && (options = { method: options.toUpperCase() });
    // 处理请求参数
    this.options.formatFetchOptions && (options = this.options.formatFetchOptions(options));
    // 发送请求
    let responseResult = await request(url, options);
    // 处理结果
    this.options.formatResponse && (responseResult = await this.options.formatResponse(responseResult, options));
    // 返回数据
    return responseResult;
  }
}
