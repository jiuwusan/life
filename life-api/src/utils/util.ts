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

/**
 * 休眠
 * @param ms 毫秒
 * @returns
 */
export function nextSleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化时间
 * @param date
 * @param format yyyy-MM-dd HH:mm:ss
 * @returns
 */
export const formatDateToStr = (date?: number | Date | string, format?: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  });
  // 创建时间对象
  const parts = formatter.formatToParts(date instanceof Date ? date : new Date(date || ''));

  const formattedDate = parts.reduce((result, part) => {
    switch (part.type) {
      case 'year':
        return result.replace('yyyy', part.value);
      case 'month':
        return result.replace('MM', part.value);
      case 'day':
        return result.replace('dd', part.value);
      case 'hour':
        return result.replace('HH', part.value === '24' ? '00' : part.value);
      case 'minute':
        return result.replace('mm', part.value);
      case 'second':
        return result.replace('ss', part.value);
      default:
        return result;
    }
  }, format || 'yyyy-MM-dd HH:mm:ss');

  return formattedDate;
};
