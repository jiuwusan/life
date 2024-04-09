/**
 * 追加 URL 参数
 *
 * @param url
 * @param query
 * @returns
 */
export const appendQueryParams = (url: string, query: Record<string, any>) => {
  const queryParams = Object.keys(query)
    .map(keyStr => {
      let value = query[keyStr];
      try {
        switch (typeof value) {
          case 'object':
            value = JSON.stringify(query[keyStr]);
            break;
          case 'string':
            const urlPathRegex = /\/[\S]+$/;
            urlPathRegex.test(value) && (value = encodeURIComponent(value));
            break;
        }
      } catch (error) {
        // 格式化出错
      }

      return `${keyStr}=${query[keyStr]}`;
    })
    .join('&');
  return url.includes('?') ? `${url}&${queryParams}` : `${url}?${queryParams}`;
};
