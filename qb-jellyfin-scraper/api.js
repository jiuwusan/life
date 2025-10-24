const request = require('./request');

const JELLYFIN_SERVER_URL = process.env.JELLYFIN_SERVER_URL;
const JELLYFIN_X_EMBY_TOKEN_USER_ID = process.env.JELLYFIN_X_EMBY_TOKEN_USER_ID;
const JELLYFIN_X_EMBY_TOKEN = process.env.JELLYFIN_X_EMBY_TOKEN;
const DINGDING_WEBHOOK_TOKEN = process.env.DINGDING_WEBHOOK_TOKEN;
const ALI_AI_API_TOKEN = process.env.ALI_AI_API_TOKEN;
const GEMINI_AI_API_TOKEN = process.env.GEMINI_AI_API_TOKEN;

// const JELLYFIN_SERVER_URL = 'https://cloud.jiuwusan.cn:36443/jellyfin';
// const JELLYFIN_X_EMBY_TOKEN_USER_ID = '0684f8441d8c42cf90fd4adf212983ee';
// const JELLYFIN_X_EMBY_TOKEN = '728a845fa9da46cdaad205b6b8ea14b7';
// const DINGDING_WEBHOOK_TOKEN = 'f36d504ec20bac730fe83dfd89517611232d99d39c097158fa16c1729582e997';
// const ALI_AI_API_TOKEN = 'sk-6a05e0f81ad04c038fef0053b040e3d6';
// const GEMINI_AI_API_TOKEN = 'AIzaSyC4w2fgNRd63DATqYWOPTzH_Y4lflgZ7Zw';
// const JELLYFIN_COLLECTION_TYPES = process.env.JELLYFIN_COLLECTION_TYPES;

const extractChinese = filename => {
  // 匹配中文字符（含中文标点）
  const matches = filename.match(/[\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef]+/g);
  return (matches || [])[0] || '';
};

const extractYear = filename => {
  const matches = filename.match(/\b(19|20)\d{2}\b/);
  return (matches || [])[0] || '';
};

module.exports = {
  refreshLibrarys: () =>
    request(`${JELLYFIN_SERVER_URL}/Library/Refresh`, { method: 'POST', headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN, 'Content-Type': 'application/json' } }),
  queryScheduledTasks: taskId =>
    request(`${JELLYFIN_SERVER_URL}/ScheduledTasks` + (taskId ? `/${taskId}` : ''), {
      headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN }
    }),
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
  queryRemoteSearch: (type, data) =>
    request(`${JELLYFIN_SERVER_URL}/Items/RemoteSearch/${type}`, { data, method: 'POST', headers: { 'X-Emby-Token': JELLYFIN_X_EMBY_TOKEN, 'Content-Type': 'application/json' } }),
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
    const result = { Name: '', Year: '' };
    if (!ALI_AI_API_TOKEN && !GEMINI_AI_API_TOKEN) {
      console.log('未配置阿里云 API 密钥，使用正则 pattern 匹配中文名称');
      return result;
    }
    const systemPrompt = '我是一个影视爱好者，使用jellyfin搭建了家庭影院';
    const userPrompt = `这是“${name}”某个影视文件/文件夹名称,请结合全球影视资料库（TheTVDB/TheMovieDB/TMDB/IMDb/豆瓣...）分析并仅返回影视名称（优先中文名称，如无中文名称则返回英文名称，不要混用，不要包含季信息）和年份，使用“|”分割`;
    if (GEMINI_AI_API_TOKEN && (!result.Name || !result.Year)) {
      // 谷歌 AI API
      try {
        const result1 = await request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
          data: {
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}。${userPrompt}`
                  }
                ]
              }
            ]
          },
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_AI_API_TOKEN }
        });
        console.log('GEMINI AI Result:', result1?.candidates?.[0].content?.parts?.[0], result1?.usageMetadata);
        const result1Text = result1?.candidates?.[0].content?.parts?.[0]?.text || '';
        result1Text && ([result.Name, result.Year] = result1Text.replace(/\s+/g, '')?.split('|'));
      } catch (error) {
        console.log('GEMINI AI Error:', error);
      }
    }
    if (ALI_AI_API_TOKEN && (!result.Name || !result.Year)) {
      // 阿里国内 AI API
      try {
        const result2 = await request(`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`, {
          data: {
            model: 'qwen3-max', // deepseek-r1
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: userPrompt
              }
            ]
          },
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ALI_AI_API_TOKEN}` }
        });
        console.log('ALI AI Result:', result2?.choices?.[0]?.message, result2?.usage);
        const result2Text = result2?.choices?.[0]?.message?.content || '';
        result2Text && ([result.Name, result.Year] = result2Text.replace(/\s+/g, '')?.split('|'));
      } catch (error) {
        console.log('ALI AI Error:', error);
      }
    }

    if (!result.Name || !result.Year) {
      [result.Name, result.Year] = [extractChinese(name), extractYear(name)];
    }
    console.log('Media Name Result:', result);
    return result;
  }
};
