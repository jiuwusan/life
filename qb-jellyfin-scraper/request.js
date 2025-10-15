const appendQueryParams = (url, query = {}) => {
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

const request = async (url, options = {}) => {
  if (options && typeof options === 'object') {
    options.query && typeof url === 'string' && (url = appendQueryParams(url, options.query));
    options.data && (options.body = JSON.stringify(options.data));
    delete options.query;
    delete options.data;
  }
  console.log(`${new Date().toLocaleString()} | 发送请求：${url}`, JSON.stringify(options));
  const response = await fetch(url, options);
  try {
    return await response.json();
  } catch (error) {}
  return response;
};

module.exports = request;
