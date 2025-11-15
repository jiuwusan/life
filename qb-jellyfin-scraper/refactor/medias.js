const { Jellyfin } = require('./jellyfin');
const { QBittorrent } = require('./qBittorrent');
const { QueueTasks } = require('./queueTasks');
const { AiChat } = require('./aichat');

class AutomatedMedias {
  /**
   * @param {object} config
   * @param {string} config.qBittorrent
   * @param {string} config.jellyfin
   * @param {string} config.aichat
   * @param {string} config.notification
   * @param {string} config.collectionTypes
   */
  constructor(config) {
    this.platformName = config.platformName;
    this.collectionTypes = config.collectionTypes;
    this.jellyfin = new Jellyfin(config.jellyfin);
    this.qBittorrent = new QBittorrent(config.qBittorrent);
    this.aiChat = new AiChat(config.aichat);
    this.notification = new AiChat(config.notification);
    // 队列任务
    this.qBittorrentTasks = new QueueTasks({ name: 'qBittorrent', delay: 2000, callback: data => this.checkAndRenameFiles(data) });
    this.notificationTasks = new QueueTasks({ name: 'notification', delay: 2000, callback: data => this.checkAndRenameFiles(data) });
    this.remoteSearchTasks = new QueueTasks({ name: 'remoteSearch', delay: 2000, callback: data => this.checkAndRenameFiles(data) });
    this.librarysTasks = new QueueTasks({ name: 'librarys', delay: 2000, callback: data => this.checkAndRenameFiles(data) });
  }

  /**
   * 刷新媒体库
   */
  async refresh(data) {
    const { action } = data;
    switch (action) {
      case 'completed':
        this.librarysTasks.pushTask();
      case 'added':
        this.qBittorrentTasks.pushTask(data);
        // this.notificationTasks.pushTask(formatQBittorrentNotice(data));
        break;
      case 'refresh':
        this.librarysTasks.pushTask();
        break;
    }
    // 刷新媒体库
    return '刷新任务已提交，请稍后查看结果。';
  }
  /**
   * 搜索全球媒体库
   */
  async queryRemoteSearch() {}
  /**
   * 刷新单个媒体资源信息
   */

  async refreshItem() {}
  /**
   * 刷新媒体库
   */

  async pollingLibrarysRefresh() {}
  /**
   * 查询待刮削资源
   */

  async queryPendingFolderItems() {}
  /**
   * 检查并重命名文件
   */

  async checkAndRenameFiles() {}
}

module.exports = { AutomatedMedias };
