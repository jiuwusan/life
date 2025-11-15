class QBittorrent {
  // cookie_sid = 'SID=/nszzfd1aJY7M2oGrtTB1mR2G+MhCcO2';
  /**
   * @param {object} config
   * @param {string} config.server
   * @param {string} config.username
   * @param {string} config.password
   */
  constructor(config) {
    if (typeof config === 'string') {
      // 兼容字符串配置
      const [server, username, password] = config.split(';');
      config = { server, username, password };
    }
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
      // options.data && (options.body = JSON.stringify(options.data));
      options.data && (options.body = new URLSearchParams(options.data));
      delete options.query;
      delete options.data;
    }
    // 添加请求头
    !options && (options = {});
    options.headers = { ...(options.headers || {}), Cookie: this.cookie_sid || '' };
    console.log(`request：${this.config.server}/api/v2/${url}`, options);
    const response = await fetch(`${this.config.server}/api/v2/${url}`, options);
    // console.log(`response:`, response);
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

  async checkAndRenameFiles({ hash, userRegExp, userRenameRegExp, skipRename = false, folderRename = false, fields, padLength }) {
    const files = (await this.fetchApi('torrents/files', { query: { hash } })) || [];
    if (skipRename) {
      return !fields ? files : files.map(item => fields.split(',').reduce((acc, cur) => ({ ...acc, [cur]: item[cur] }), {}));
    }
    const regExp = new RegExp('S(\\d{2})E(\\d{2,})');
    const regExp1 = new RegExp('S(\\d{2})[\\.\\s\\-]?EP?(\\d{2,})');
    const regExp2 = new RegExp('EP?(\\d{2,})');
    for (let index = 0; index < files.length; index++) {
      const current = files[index];
      !folderRename && (current.splitNames = current.name.split('/'));
      const fileName = !folderRename ? current.splitNames.pop() : current.name;
      if (userRegExp && userRenameRegExp) {
        !padLength && (current.newPath = fileName.replace(new RegExp(userRegExp, 'gi'), userRenameRegExp));
        padLength &&
          (current.newPath = fileName.replace(new RegExp(userRegExp, 'gi'), (matched, ...captures) => {
            console.log('matched:', matched);
            let nextRenameRegExp = userRenameRegExp;
            // 如果是纯数字，根据 padLength 填充 0
            for (let i = 0; i < captures.length; i++) {
              const current = captures[i];
              /^\d+$/.test(current) && (nextRenameRegExp = nextRenameRegExp.replace(`$${i + 1}`, String(current).padStart(Number(padLength), '0')));
            }
            return nextRenameRegExp;
          }));
        continue;
      }
      // 处理名称
      const matched = fileName.match(regExp);
      if (matched) {
        console.log(`${matched.input} matched result:`, ...matched);
        continue;
      }
      const matched1 = fileName.match(regExp1);
      if (matched1) {
        console.log(`${matched1.input} matched1 result:`, ...matched1);
        current.newPath = fileName.replace(regExp1, `S$1E$2`);
        continue;
      }
      const matched2 = fileName.match(regExp2);
      if (matched2) {
        console.log(`${matched2.input} matched2 result:`, ...matched2);
        current.newPath = fileName.replace(regExp2, `S01E$1`);
        continue;
      }
    }
    // 格式化
    const newFiles = files.map(({ index, name: oldPath, newPath, splitNames }) => ({
      index,
      hash,
      oldPath,
      newPath: newPath ? (splitNames ? [...splitNames, newPath].join('/') : newPath) : '',
      success: true
    }));
    // 发送请求
    for (let index = 0; index < newFiles.length; index++) {
      const { hash, oldPath, newPath } = newFiles[index];
      if (newPath) {
        try {
          await this.fetchApi('torrents/renameFile', { method: 'POST', data: { hash, oldPath, newPath } });
        } catch (error) {
          newFiles[index].success = false;
        }
      }
    }

    return newFiles;
  }
}

module.exports = { QBittorrent };
