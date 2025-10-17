const API = require('./api');
const util = require('./util');

/**
 * 休眠
 *
 * @param {*} delay
 * @returns
 */
const nextSleep = delay => new Promise(resolve => setTimeout(resolve, delay));

const createTasks = ({ name, callback }) => {
  const tasks = [];
  let processing = false;

  const startTasks = async () => {
    if (processing) {
      return;
    }
    processing = true;
    // 每次只取一个任务，直到 tasks 为空，需要考虑 tasks 随时 push 新任务的情况
    while (tasks.length > 0) {
      await nextSleep(1000);
      console.log(`${name}:  ${tasks.length}`);
      callback && typeof callback === 'function' && (await callback(tasks.shift()));
    }
    processing = false;
  };

  const pushTask = taskParams => {
    !taskParams && (taskParams = { timestamp: Date.now() });
    const newParams = Array.isArray(taskParams) ? taskParams : [taskParams];
    tasks.push(...newParams);
    startTasks();
    return tasks.length;
  };

  const getTasks = () => tasks;

  return { getTasks, pushTask, startTasks };
};

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
    console.log('更新媒体信息：', { ItemId, ...current });
    // 异步更新更新媒体信息
    API.updateMediaInfo(ItemId, current);
  };
})();

const mediainfos = createTasks({
  name: 'mediainfos',
  callback: updateMediaInfo
});

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

const notifications = createTasks({
  name: 'notifications',
  callback: async params => {
    console.log('start processing notifications task...', params);
    try {
      // action = downloading,completed; 1024 * 1024 * 1024
      const { client, action = 'added', name, hash, savePath, size = 0, category } = params;
      const actionName = action === 'completed' ? '下载完成' : '添加成功';
      const title = `qBittorrent ${actionName}`;
      const text = `#### qBittorrent ${client} ${actionName}
> **${name}**
> ${hash}
- 路径：${savePath}
- 存储：${(size / (1024 * 1024 * 1024)).toFixed(2)} GB
- 分类：${category}
- 时间：${util.formatDateToStr()}`;
      const result = await API.sendWebhook({
        msgtype: 'markdown',
        markdown: {
          title,
          text
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
});

const refresh = async data => {
  // 刷新媒体库
  return {
    librarys: await librarys.pushTask(),
    notifications: await notifications.pushTask(data)
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
