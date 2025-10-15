const request = require('./request');
// const Jellyfin_SERVER_URL = process.env.Jellyfin_SERVER_URL;
// const Jellyfin_X_Emby_Token = process.env.Jellyfin_X_Emby_Token;
// const DINGDING_WEBHOOK_TOKEN = process.env.DINGDING_WEBHOOK_TOKEN;

const Jellyfin_SERVER_URL = 'https://cloud.jiuwusan.cn:36443/jellyfin';
const Jellyfin_X_Emby_Token = '728a845fa9da46cdaad205b6b8ea14b7';
const DINGDING_WEBHOOK_TOKEN = 'f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997';

const API = {
  refreshLibrarys: () => request(`${Jellyfin_SERVER_URL}/Library/Refresh`, { headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token, 'Content-Type': 'application/json' } }),
  queryVirtualFolders: () => request(`${Jellyfin_SERVER_URL}/Library/VirtualFolders`, { headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token } }),
  queryFolderItems: ParentId =>
    request(`${Jellyfin_SERVER_URL}/Items`, {
      query: { ParentId, StartIndex: 0, Limit: 20, SortOrder: 'Descending', SortBy: 'DateCreated' },
      headers: { 'X-Emby-Token': Jellyfin_X_Emby_Token }
    })
};

/**
 * 休眠
 *
 * @param {*} delay
 * @returns
 */
const nextSleep = delay => new Promise(resolve => setTimeout(resolve, delay));

const librarys = (() => {
  const tasks = [];
  let processing = false;
  const runingTask = async () => {
    console.log('start processing refresh task...');
    try {
      // await API.refreshLibrarys();
      await nextSleep(30000);
      // const folders = await API.queryVirtualFolders();
      // const tvshowsFolders = folders.filter(item => item.CollectionType === 'tvshows');
      // const pendings = [];
      // for (let i = 0; i < tvshowsFolders.length; i++) {
      //   const current = tvshowsFolders[i];
      //   const result = await API.queryFolderItems(current.ItemId);
      //   Array.prototype.push.apply(
      //     pendings,
      //     result.Items.filter(item => !item.Status && !item.ProductionYear)
      //   );
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const startTasks = async () => {
    if (processing) {
      return;
    }
    processing = true;
    // 每次只取一个任务，直到 tasks 为空，需要考虑 tasks 随时 push 新任务的情况
    while (tasks.length) {
      await nextSleep(1000);
      console.log('remaining refresh tasks:', tasks.length);
      tasks.shift();
      await runingTask();
    }
    processing = false;
  };

  const pushTask = () => {
    tasks.push({ timestamp: Date.now() });
    startTasks();
    return tasks.length;
  };

  const getTasks = () => tasks;

  return { getTasks, pushTask, startTasks };
})();

const notifications = (() => {
  const tasks = [];
  let processing = false;
  const runingTask = async () => {
    console.log('start processing notification task...');
    try {
      await nextSleep(1000);
    } catch (error) {
      console.log(error);
    }
  };

  const startTasks = async () => {
    if (processing) {
      return;
    }
    processing = true;
    // 每次只取一个任务，直到 tasks 为空，需要考虑 tasks 随时 push 新任务的情况
    while (tasks.length) {
      await nextSleep(1000);
      console.log('remaining notification tasks:', tasks.length);
      tasks.shift();
      await runingTask();
    }
    processing = false;
  };

  const pushTask = () => {
    tasks.push({ timestamp: Date.now() });
    startTasks();
    return tasks.length;
  };

  const getTasks = () => tasks;

  return { getTasks, pushTask, startTasks };
})();

const refresh = async req => {
  // 刷新媒体库
  return JSON.stringify({
    librarys: await librarys.pushTask().length,
    notifications: await notifications.pushTask().length
  });
};

module.exports = { refresh };
