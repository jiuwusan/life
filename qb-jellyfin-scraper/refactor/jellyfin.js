class Jellyfin {
  config = {};
  /**
   * @param {object} config
   * @param {string} config.server
   * @param {string} config.username
   * @param {string} config.password
   * @param {string} config.token
   * @param {string} config.userid
   */
  constructor(config) {
    this.config = config;
  }

   async request(url, options) {
    // 处理参数
    if (options && typeof options === 'object') {
      if (options.query && typeof url === 'string') {
        const queryStr = Object.keys(options.query)
          .map(key => `${key}=${options.query[key]}`)
          .join('&');
        // 拼接 url
        url.includes('?') ? (url += `&${queryStr}`) : (url += `?${queryStr}`);
      }
      options.data && (options.body = JSON.stringify(options.data));
      // options.data && (options.body = new URLSearchParams(options.data));
      delete options.query;
      delete options.data;
    }
    // 添加请求头
    !options && (options = {});
    options.headers = { ...(options.headers || {}), Cookie: this.cookie_sid || '' };
    console.log(`request：${this.config.server}/api/v2/${url}`, options);
    const response = await fetch(`${this.config.server}/api/v2/${url}`, options);
    try {
      return await response.json();
    } catch (error) {
      // 返回的不是 JSON
    }
    return response;
  }

  async authorization() {
    const { username, password } = this.config;
    this.cookie_sid = '';
    const response = await this.request('auth/login', {
      method: 'POST',
      data: { username, password }
    });
    const cookies = response.headers.get('set-cookie');
    // 提取 SID
    const cookie_sid = ((cookies || '').match(/SID=([^;]+)/) || [])[0];
    console.log(`qBittorrent 登录成功：${cookie_sid}`);
    this.cookie_sid = cookie_sid;
  }

  async fetchApi(url, options = {}, firstTime) {
    const result = await this.request(url, { ...options });
    if ([401, 403].includes(result?.status) && !firstTime) {
      await this.authorization(); // 授权
      return await this.fetchApi(url, { ...options }, true);
    }
    return result;
  }

}

module.exports = { Jellyfin };