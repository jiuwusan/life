const request = require('./request');
// const Jellyfin_SERVER_URL = process.env.Jellyfin_SERVER_URL;
// const Jellyfin_X_Emby_Token = process.env.Jellyfin_X_Emby_Token;
// const DINGDING_WEBHOOK_TOKEN = process.env.DINGDING_WEBHOOK_TOKEN;

const Jellyfin_SERVER_URL = 'https://cloud.jiuwusan.cn:36443/jellyfin';
const Jellyfin_X_Emby_Token = '728a845fa9da46cdaad205b6b8ea14b7';
const DINGDING_WEBHOOK_TOKEN = 'f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997';

const API = {
  refreshLibrarys: () =>
    request(`${Jellyfin_SERVER_URL}/Library/Refresh`, { method: 'POST', headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token, 'Content-Type': 'application/json' } }),
  queryVirtualFolders: () => request(`${Jellyfin_SERVER_URL}/Library/VirtualFolders`, { headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token } }),
  queryFolderItems: ParentId =>
    request(`${Jellyfin_SERVER_URL}/Items`, {
      query: { ParentId, StartIndex: 0, Limit: 20, SortOrder: 'Descending', SortBy: 'DateCreated' },
      headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token }
    }),
  queryRemoteSearch: data =>
    request(`${Jellyfin_SERVER_URL}/Items/RemoteSearch/Series`, { data, method: 'POST', headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token, 'Content-Type': 'application/json' } }),
  updateMediaInfo: (mediaId, data) =>
    request(`${Jellyfin_SERVER_URL}/Items/RemoteSearch/Apply/${mediaId}?ReplaceAllImages=true`, {
      data,
      method: 'POST',
      headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token, 'Content-Type': 'application/json' }
    })
};

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
      console.log(`${name}:  ${tasks.length}`);
      callback && typeof callback === 'function' && (await callback(tasks.shift()));
      await nextSleep(1000);
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

const extractChinese = str => {
  // 匹配中文字符（含中文标点）
  const matches = str.match(/[\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef]+/g);
  return (matches || [])[0] || '';
};

const updateMediaInfo = (() => {
  const updateds = [];
  return async params => {
    console.log('start processing mediainfos task...', params);
    const Name = extractChinese(params.Name);
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
      ItemId: params.Id
    });
    console.log('搜索结果：', result);
    if (result?.length < 1) {
      return;
    }
    const current = result[0];
    const updateResult = await API.updateMediaInfo(params.Id, current);
    console.log('更新结果：', updateResult?.status);
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
      await nextSleep(5000);
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
      // send webhook
    } catch (error) {
      console.log(error);
    }
  }
});

const refresh = async req => {
  // 刷新媒体库
  return JSON.stringify({
    librarys: await librarys.pushTask(),
    notifications: await notifications.pushTask()
  });
};

module.exports = { refresh };
