const API = require('./api');
const { formatDateToStr, nextSleep } = require('./util');
const { createTasks } = require('./tasks');
const JELLYFIN_COLLECTION_TYPES = (process.env.NODE_ENV === 'production' ? process.env.JELLYFIN_COLLECTION_TYPES : 'movies,tvshows') || '';

/**
 * 等待媒体库扫描完成
 */
const waitingMediasScanCompleted = async (taskId = '', totalDuration = 0) => {
  const duration = 1000 * 15;
  await nextSleep(duration);
  let result = (await API.queryScheduledTasks(taskId)) || [];
  !Array.isArray(result) && (result = [result]);
  const current = result.find(item => item?.Key === 'RefreshLibrary' || item?.Name === '扫描媒体库');
  if (!current || current?.State === 'Idle' || totalDuration >= 1000 * 60 * 30) {
    console.log(`进程Id=${current?.Id || ''}，媒体库扫描 已结束 或 不存在！`);
    return;
  }
  console.log(`进程Id=${current.Id}，媒体库扫描状态：${current.State}，进度：${current.CurrentProgressPercentage}`);
  return await waitingMediasScanCompleted(current.Id, totalDuration + duration);
};

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

const queryRemoteSearch = (() => {
  const completed = {};
  return async mediaItem => {
    const { Id: ItemId, Name: ItemName = '', Refresh = false } = mediaItem;
    if (completed[ItemId]) {
      console.log('【缓存】无需重复刮削:', { ItemId, ItemName });
      return;
    }
    const { Path = '', ProviderIds = {}, Type } = await API.queryMediaItemInfo(ItemId);
    if (Object.keys(ProviderIds).length > 0 && !Refresh) {
      console.log('查询媒体库，发现媒体信息已刮削，无需重复刮削:', { ItemId, ItemName, Type, ProviderIds, Path });
      completed[ItemId] = true;
      return;
    }
    console.log('itemInfo Path:', Path);
    const BeforeName = Path.split('/').pop() || ItemName;
    const { Name, Year } = await API.getMediaName({ name: BeforeName });
    console.log('Name Processing Result:', { Name, Year, Type, ItemName, BeforeName, Path });
    if (!Name) {
      console.log('获取媒体名称无结果，跳过...');
      return;
    }
    const SearchInfo = {
      ProviderIds: {
        AniDB: '',
        Imdb: '',
        Tmdb: '',
        TmdbCollection: '',
        TvdbCollection: '',
        Tvdb: '',
        TvdbSlug: '',
        Zap2It: ''
      },
      Year,
      Name
    };
    let result = await API.queryRemoteSearch(Type, {
      SearchInfo,
      ItemId
    });
    console.log('刮削结果 1：', result);
    if (result?.length < 1 && Name.includes('：')) {
      result = await API.queryRemoteSearch(Type, {
        SearchInfo: {
          ...SearchInfo,
          Name: Name.split('：')[0]
        },
        ItemId
      });
      console.log('刮削结果 2：', result);
    }
    if (result?.length < 1) {
      delete SearchInfo.Year;
      result = await API.queryRemoteSearch(Type, {
        SearchInfo,
        ItemId
      });
      console.log('刮削结果 3：', result);
    }
    if (result?.length < 1 && Name.includes('：')) {
      result = await API.queryRemoteSearch(Type, {
        SearchInfo: {
          ...SearchInfo,
          Name: Name.split('：')[0]
        },
        ItemId
      });
      console.log('刮削结果 4：', result);
    }
    return {
      ItemId,
      Name,
      Path,
      ProviderInfo: (result || []).find(item => item.Name === Name) || result?.[0]
    };
  };
})();

const formatMediaResultNotice = params => {
  const {
    Path,
    ProviderInfo: { Name, ImageUrl }
  } = params || {};
  const title = `jellyfin 刮削成功`;
  const text = `![](${ImageUrl})
- 影视：**${Name}**
- 路径：${Path}
- 时间：${formatDateToStr()}`;
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
  const blocked = {};
  return async params => {
    const { Id: ItemId, Name: ItemName } = params;
    if (blocked[ItemId]) {
      console.log('资源异常，跳过...', ItemName);
      return;
    }
    if (Date.now() - (updateds[ItemId] || 0) < 1000 * 60 * 15) {
      console.log('距离上次刮削时间小于15分钟，跳过...', ItemName);
      return;
    }
    updateds[ItemId] = Date.now();
    const current = await queryRemoteSearch(params);
    if (current?.ProviderInfo) {
      console.log('更新媒体信息：', current);
      notifications.pushTask(formatMediaResultNotice(current));
      // 异步更新更新媒体信息
      API.updateMediaInfo(ItemId, current.ProviderInfo);
    }
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
 * 获取等待刮削列表
 * @returns
 */
const queryPendingFolderItems = async () => {
  // 获取等待刮削列表
  const list = [];
  const folders = await API.queryVirtualFolders();
  const includedFolders = folders.filter(item => JELLYFIN_COLLECTION_TYPES.includes(item.CollectionType));
  for (let i = 0; i < includedFolders.length; i++) {
    const { ItemId } = includedFolders[i];
    const result = await API.queryFolderItems(ItemId);
    list.push(
      ...result.Items.filter(item => {
        const { Type, Status, CriticRating, OfficialRating, CommunityRating } = item;
        // 是否有评分
        const isRating = ['string', 'number'].includes(typeof (CriticRating || OfficialRating || CommunityRating));
        // 是否需要刮削
        let isPending = false;
        switch (Type) {
          case 'Series':
            isPending = !Status && !isRating;
            break;
          case 'Movie':
            isPending = !isRating;
            break;
          // case 'Folder':
          //   isPending = false;
          //   break;
        }
        return isPending;
      })
    );
  }
  return list;
};

const pollingLibrarysRefresh = async () => {
  const list = await queryPendingFolderItems();
  if (list.length < 1) {
    return 0;
  }
  let result = (await API.queryScheduledTasks()) || [];
  const current = result.find(item => item?.Key === 'RefreshLibrary' || item?.Name === '扫描媒体库');
  if (current?.State !== 'Idle') {
    return 0;
  }
  return mediainfos.pushTask(list);
};

/**
 * 创建媒体库刷新任务
 */
const librarys = createTasks({
  name: 'librarys',
  callback: async params => {
    console.log('start processing librarys task...', params);
    try {
      await nextSleep(5000);
      await API.refreshLibrarys();
      // 等待媒体库刷新完成
      await waitingMediasScanCompleted();
      // 针对媒体库，进行二次刮削
      const list = await queryPendingFolderItems();
      mediainfos.pushTask(list);
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
  const { action } = data;
  switch (action) {
    case 'completed':
      librarys.pushTask();
    case 'added':
      notifications.pushTask(formatQBittorrentNotice(data));
      break;
    case 'refresh':
      librarys.pushTask();
      break;
  }
  // 刷新媒体库
  return '刷新任务已提交，请稍后查看结果。';
};

const refreshItem = async data => {
  if (!data?.Id) {
    return '参数异常';
  }
  mediainfos.pushTask({ ...data, Refresh: true });
  // 刷新媒体信息
  return '刮削信息已提交，请到媒体库查看结果。';
};

module.exports = { refresh, refreshItem, pollingLibrarysRefresh, queryPendingFolderItems, queryRemoteSearch };
