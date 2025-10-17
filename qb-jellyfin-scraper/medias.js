const API = require('./api');
const { formatDateToStr, nextSleep } = require('./util');
const { createTasks } = require('./tasks');
const JELLYFIN_COLLECTION_TYPES = process.env.JELLYFIN_COLLECTION_TYPES || ''; // movies,tvshows

/**
 * 创建通知任务
 */
const notifications = createTasks({
  name: 'notifications',
  callback: async params => {
    console.log('start processing notifications task...', params);
    try {
      const result = await API.sendWebhook(params);
      console.log('notifications result:', result);
    } catch (error) {
      console.log(error);
    }
  }
});

const formatMediaResultNotice = params => {
  const { ItemId, ItemName, BeforeName, AiName, Name, ImageUrl } = params || {};
  const title = `jellyfin 刮削成功`;
  const text = `#### jellyfin 刮削成功
> **${Name}**
> ${ItemId}
- AI名称：${AiName}
- 原名称：${ItemName}
- 文件：${BeforeName}
- 时间：${formatDateToStr()}
![](${ImageUrl})`;
  return {
    msgtype: 'markdown',
    markdown: {
      title,
      text
    }
  };
};

/**
 * 更新媒体数据
 */
const updateMediaInfo = (() => {
  const updateds = {};
  return async params => {
    console.log('start processing mediainfos task...', params);
    const { Id: ItemId, Name: ItemName, CollectionType } = params;
    if (Date.now() - (updateds[ItemId] || 0) < 1000 * 60 * 30) {
      console.log('距离上次刮削时间小于30分钟，跳过...');
      return;
    }
    const itemInfo = await API.queryMediaItemInfo(ItemId);
    console.log('itemInfo:', itemInfo);
    const BeforeName = itemInfo.Path.split('/').pop() || ItemName;
    if (CollectionType === 'movies') {
      const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'webm', 'm4v', '3gp', 'ts', 'm2ts', 'vob', 'ogv', 'f4v', 'rm', 'rmvb'];
      // 电影名称必须包含后缀名
      if (!new RegExp(`\\.(${videoExts.join('|')})$`, 'i').test(BeforeName)) {
        console.log('电影名称无后缀名，跳过...', BeforeName);
        updateds[ItemId] = Date.now();
        return;
      }
    }
    const Name = (await API.getMediaName({ name: BeforeName }))?.name;
    console.log('Name Processing Result:', { ItemName, BeforeName, Name });
    if (!Name) {
      console.log('获取媒体名称无结果，跳过...');
      return;
    }
    updateds[ItemId] = Date.now();
    const result = await API.queryRemoteSearch({
      SearchInfo: {
        ProviderIds: {
          AniDB: '',
          Imdb: '',
          Tmdb: '',
          TvdbCollection: '',
          Tvdb: '',
          TvdbSlug: '',
          Zap2It: ''
        },
        Name
      },
      ItemId
    });
    console.log('刮削结果：', result);
    if (result?.length < 1) {
      return;
    }
    const current = result[0];
    formatMediaResultNotice;
    console.log('更新媒体信息：', { ItemId, ...current });
    notifications.pushTask(formatMediaResultNotice({ ItemId, ItemName, AiName: Name, BeforeName, ...current }));
    // 异步更新更新媒体信息
    API.updateMediaInfo(ItemId, current);
  };
})();

/**
 * 创建更新任务
 */
const mediainfos = createTasks({
  name: 'mediainfos',
  callback: updateMediaInfo
});

/**
 * 创建媒体库刷新任务
 */
const librarys = createTasks({
  name: 'librarys',
  callback: async params => {
    console.log('start processing librarys task...', params);
    try {
      await API.refreshLibrarys();
      await nextSleep(15000); // 等待媒体库刷新
      const folders = await API.queryVirtualFolders();
      const includedFolders = folders.filter(item => JELLYFIN_COLLECTION_TYPES.includes(item.CollectionType));
      for (let i = 0; i < includedFolders.length; i++) {
        const { ItemId, CollectionType } = includedFolders[i];
        const result = await API.queryFolderItems(ItemId);
        mediainfos.pushTask(
          result.Items.filter(item => (CollectionType === 'tvshows' && !item.Status && !item.ProductionYear) || (CollectionType === 'movies' && !item.ProductionYear)).map(
            item => ({
              ...item,
              CollectionType
            })
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
});

const formatQBittorrentNotice = params => {
  // action = downloading,completed; 1024 * 1024 * 1024
  const { client, action = 'added', name, hash, savePath, size = 0, category } = params || {};
  const actionName = action === 'completed' ? '下载完成' : '添加成功';
  const title = `qBittorrent ${actionName}`;
  const text = `#### qBittorrent ${client} ${actionName}
> **${name}**
> ${hash}
- 路径：${savePath}
- 存储：${(size / (1024 * 1024 * 1024)).toFixed(2)} GB
- 分类：${category}
- 时间：${formatDateToStr()}`;
  return {
    msgtype: 'markdown',
    markdown: {
      title,
      text
    }
  };
};

const refresh = async data => {
  // 刷新媒体库
  return {
    librarys: librarys.pushTask(),
    notifications: notifications.pushTask(formatQBittorrentNotice(data))
  };
};

const refreshItem = async data => {
  if (!data.Name || !data.Id) {
    return '参数异常';
  }
  updateMediaInfo(data);
  // 刷新媒体信息
  return '刮削信息已提交，请到媒体库查看结果。';
};

module.exports = { refresh, refreshItem };
