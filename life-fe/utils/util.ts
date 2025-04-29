/**
 * 判断是否为颜色
 * @param colorStr
 * @returns
 */
export const isColor = (colorStr: string) => {
  // 使用正则表达式匹配颜色格式
  const regex = /^#([0-9A-Fa-f]{3}){1,2}$|^#([0-9A-Fa-f]{4}){1,2}$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*\d*\.?\d+\s*)?\)$/i;
  return regex.test(colorStr);
};

/**
 * 获取背景图片
 * @returns
 */
export const getBackgroundImage = () => `/bg.jpg`;

/**
 * 拼接url参数
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
            // 对象转字符串
            value = encodeURIComponent(JSON.stringify(query[keyStr]));
            break;
          case 'string':
            const urlPathRegex = /\/[\S]+$/;
            // 如果url路径中包含/，则需要encode
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

/**
 * 判断是否为服务端
 *
 * @returns
 */
export const isServer = () => typeof window === 'undefined';

/**
 * 数组转换为字符串
 * @param str
 * @param separator
 * @returns
 */
export const strToArray = (str?: string, separator?: string) => {
  return str ? str.split(separator || ' ') : [];
};
