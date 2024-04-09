import fetch, { type RequestInfo, type RequestInit } from 'node-fetch';
import { appendQueryParams } from '@/utils/util';

interface RequestOptions extends RequestInit {
  data?: Record<string, string>;
  query?: Record<string, string>;
}

const request = (url: RequestInfo, options?: string | RequestOptions) => {
  let ACIDCount = 0;
  const ACIDREQ = async (url: RequestInfo, options?: string | RequestOptions) => {
    ACIDCount++;
    try {
      if (typeof options === 'string') {
        options = { method: 'GET' };
      }

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
        console.error(`第一次 ${ACIDCount} 尝试重连 --> ${url}`);
        return ACIDREQ(url, options);
      }
      throw error;
    }
  };

  return ACIDREQ(url, options);
};

export default request;
