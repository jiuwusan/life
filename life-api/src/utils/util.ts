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

/**
 * 拼接url
 * @param baseUrl 基础url
 * @param pathname 路径
 * @param queryParams 查询参数
 * @returns
 */
export const joinUrl = (baseUrl: string, pathname: string): string => {
  // 移除 hostname 结尾的斜杠，移除 pathname 开头的斜杠
  const cleanedBaseurl = baseUrl.replace(/\/$/, '');
  const cleanedPathname = pathname.replace(/^\//, '');

  // 使用模板字符串拼接 hostname 和 pathname
  return `${cleanedBaseurl}/${cleanedPathname}`;
};
