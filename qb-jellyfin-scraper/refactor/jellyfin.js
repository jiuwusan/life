class Jellyfin {
  config = {};
  /**
   * @param {object} config
   * @param {string} config.name
   * @param {string} config.server
   * @param {string} config.username
   * @param {string} config.password
   * @param {string} config.token
   * @param {string} config.userid
   */
  constructor(config) {
    this.config = config;
  }
}
