const API = require('./api');
const { formatDateToStr, nextSleep } = require('./util');
const { createTasks } = require('./tasks');

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
  const updateds = [];
  return async params => {
    console.log('start processing mediainfos task...', params);
    const { Id: ItemId, Name: ItemName } = params;
    const itemInfo = await API.queryMediaItemInfo(ItemId);
    console.log('itemInfo:', itemInfo);
    const BeforeName = itemInfo.Path.split('/').pop() || ItemName;
    const Name = (await API.getMediaName({ name: BeforeName }))?.name;
    console.log('Name Processing Result:', { ItemName, BeforeName, Name });
    if (!Name || updateds.includes(params.Id)) {
      return;
    }
    updateds.push(params.Id);
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
      await nextSleep(5000); // 等待媒体库刷新
      const folders = await API.queryVirtualFolders();
      const tvshowsFolders = folders.filter(item => item.CollectionType === 'tvshows');
      for (let i = 0; i < tvshowsFolders.length; i++) {
        const current = tvshowsFolders[i];
        const result = await API.queryFolderItems(current.ItemId);
        mediainfos.pushTask(result.Items.filter(item => !item.Status && !item.ProductionYear));
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
