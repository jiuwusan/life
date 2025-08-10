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

/**
 * 判断 数据是否为空
 * @param value
 * @returns
 */
export const isEmpty = (value: any) => {
  if (typeof value === 'number') {
    return false;
  }

  if (value === undefined || value === null) {
    return true;
  }

  if (!value && value !== false) {
    return true;
  }

  // 特殊 string
  if (value === '' || value === 'undefined' || value === 'null' || value === '-' || value === '--') {
    return true;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }

  //数组
  if (!value?.length) {
    return true;
  }

  // 不对 object 进行特殊判断

  return false;
};

export const validationParameter = (params: Record<string, any>, rules: string[] | Record<string, boolean | string | ((value: any) => void | string)>) => {
  const defRules = Array.isArray(rules)
    ? rules.reduce((result, current) => {
      result[current] = true;
      return result;
    }, {})
    : rules;
  const keyStrs = Object.keys(defRules);

  if (keyStrs.length === 0) {
    return;
  }

  for (let index = 0; index < keyStrs.length; index++) {
    const current = keyStrs[index];
    switch (typeof defRules[current]) {
      case 'boolean':
        if (isEmpty(params[current])) {
          throw new Error(`${current}是必要参数`);
        }
        break;
      case 'function':
        const message = defRules[current](params);
        if (message) {
          throw new Error(`${current}：${message}`);
        }
        break;
      case 'string':
        // 正则
        break;
    }
  }
};

/**
 * 获取保存到数据库的时间，使用 UTC
 *
 * @param value
 */
export const getDatabaseDateStr = (value?: number | string | Date): string => {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  // return date.toISOString().replace('T', ' ').slice(0, 19);
  return date.toISOString();
};

/**
 * 通用 UUID 生成器
 * @param length 生成的十六进制字符数（不含分隔符），默认 32
 * @param withHyphen 是否包含分隔符（标准 UUID 格式），默认 false
 * @param upperCase 是否转大写，默认 true
 * @returns UUID 字符串
 */
export const uuid = (option?: { length: number, withHyphen: boolean, upperCase: boolean }): string => {
  const { length = 32, withHyphen = false, upperCase = true } = option || {};
  // 标准 UUID v4 模板
  let template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  if (!withHyphen) {
    template = template.replace(/-/g, '');
  }

  // 根据 length 截断模板或扩展
  if (length && length !== (withHyphen ? 36 : 32)) {
    template = 'x'.repeat(length);
  }

  let result = template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  return upperCase ? result.toUpperCase() : result.toLowerCase();
};