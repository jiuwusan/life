const request = require('./request');

const JELLYFIN_SERVER_URL = process.env.JELLYFIN_SERVER_URL;
const JELLYFIN_X_EMBY_TOKEN_USER_ID = process.env.JELLYFIN_X_EMBY_TOKEN_USER_ID;
const JELLYFIN_X_EMBY_TOKEN = process.env.JELLYFIN_X_EMBY_TOKEN;
const DINGDING_WEBHOOK_TOKEN = process.env.DINGDING_WEBHOOK_TOKEN;
const AI_API_TOKEN = process.env.AI_API_TOKEN;

// const JELLYFIN_SERVER_URL = 'https://cloud.jiuwusan.cn:36443/jellyfin';
// const JELLYFIN_X_EMBY_TOKEN_USER_ID = '0684f8441d8c42cf90fd4adf212983ee';
// const JELLYFIN_X_EMBY_TOKEN = '728a845fa9da46cdaad205b6b8ea14b7';
// const DINGDING_WEBHOOK_TOKEN = 'f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997';
// const AI_API_TOKEN = 'sk-6a05e0f81ad04c038fef0053b040e3d6';
// const JELLYFIN_COLLECTION_TYPES = process.env.JELLYFIN_COLLECTION_TYPES;

const extractChinese = str => {
  // 匹配中文字符（含中文标点）
  const matches = str.match(/[\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef]+/g);
  return (matches || [])[0] || '';
};

module.exports = {
  refreshLibrarys: () =>
    request(`${JELLYFIN_SERVER_URL}/Library/Refresh`, { method: 'POST', headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN, 'Content-Type': 'application/json' } }),
  queryVirtualFolders: () => request(`${JELLYFIN_SERVER_URL}/Library/VirtualFolders`, { headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN } }),
  queryFolderItems: ParentId =>
    request(`${JELLYFIN_SERVER_URL}/Items`, {
      query: { ParentId, StartIndex: 0, Limit: 100, SortOrder: 'Descending', SortBy: 'DateCreated' },
      headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN }
    }),
  queryMediaItemInfo: itemId => {
    if (!JELLYFIN_X_EMBY_TOKEN_USER_ID) {
      return { code: 200, message: '未配置用户ID，请自行处理', Path: '' };
    }
    return request(`${JELLYFIN_SERVER_URL}/Users/${JELLYFIN_X_EMBY_TOKEN_USER_ID}/Items/${itemId}`, {
      headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN }
    });
  },
  queryRemoteSearch: data =>
    request(`${JELLYFIN_SERVER_URL}/Items/RemoteSearch/Series`, { data, method: 'POST', headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN, 'Content-Type': 'application/json' } }),
  updateMediaInfo: (mediaId, data) =>
    request(`${JELLYFIN_SERVER_URL}/Items/RemoteSearch/Apply/${mediaId}?ReplaceAllImages=true`, {
      data,
      method: 'POST',
      headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN, 'Content-Type': 'application/json' }
    }),
  sendWebhook: data => {
    if (!DINGDING_WEBHOOK_TOKEN) {
      return { code: 200, message: '未配置钉钉机器人 webhook，请自行处理' };
    }
    return request(`https://oapi.dingtalk.com/robot/send?access_token=${DINGDING_WEBHOOK_TOKEN}`, {
      data,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },
  getMediaName: async ({ name }) => {
    if (!AI_API_TOKEN) {
      return { status: 200, message: '未配置阿里云 API 密钥，使用正则 pattern 匹配中文名称', name: extractChinese(name) };
    }
    const result = await request(`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`, {
      data: {
        model: 'qwen3-max',
        messages: [
          {
            role: 'system',
            content: '我是一个影视爱好者，使用jellyfin搭建了家庭影院'
          },
          {
            role: 'user',
            content: `这是“${name}”某个影视文件/文件夹名称,请结合全球影视资料库（TheTVDB/TheMovieDB/TMDB/IMDb/豆瓣...）分析并仅返回影视中文名称`
          }
        ]
      },
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_TOKEN}` }
    });
    console.log('AI Result:', result?.choices?.[0]);
    return { code: 200, message: '成功', name: result?.choices?.[0]?.message?.content ?? extractChinese(name) };
  }
};
