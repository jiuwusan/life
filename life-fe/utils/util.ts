/**
 * 判断是否为颜色
 * @param colorStr
 * @returns
 */
export const isColor = (colorStr: string) => {
  // 使用正则表达式匹配颜色格式
  const regex =
    /^#([0-9A-Fa-f]{3}){1,2}$|^#([0-9A-Fa-f]{4}){1,2}$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*\d*\.?\d+\s*)?\)$/i;
  return regex.test(colorStr);
};

/**
 * 获取背景图片
 * @returns
 */
export const getBackgroundImage = () => `/ui/bg/${Math.floor(Math.random() * 4)}.jpg`;

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
  console.log('joinUrl------>',{baseUrl,pathname})
  // 移除 hostname 结尾的斜杠，移除 pathname 开头的斜杠
  const cleanedBaseurl = baseUrl.replace(/\/$/, '');
  const cleanedPathname = pathname.replace(/^\//, '');

  // 使用模板字符串拼接 hostname 和 pathname
  return `${cleanedBaseurl}/${cleanedPathname}`;
};
