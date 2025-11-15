const http = require('node:http');
const url = require('node:url');
const { AutomatedMedias } = require('./medias');

// 环境变量
const JELLYFIN_COLLECTION_TYPES = (process.env.NODE_ENV === 'production' ? process.env.JELLYFIN_COLLECTION_TYPES : 'movies,tvshows') || '';
const JELLYFIN_SERVER_URL = process.env.JELLYFIN_SERVER_URL;
const JELLYFIN_X_EMBY_TOKEN_USER_ID = process.env.JELLYFIN_X_EMBY_TOKEN_USER_ID;
const JELLYFIN_X_EMBY_TOKEN = process.env.JELLYFIN_X_EMBY_TOKEN;
const DINGDING_WEBHOOK_TOKEN = process.env.DINGDING_WEBHOOK_TOKEN;
const QBITTORRENT_CONFIG = process.env.QBITTORRENT_CONFIG;
const ALI_AI_API_TOKEN = process.env.ALI_AI_API_TOKEN;
const GEMINI_AI_API_TOKEN = process.env.GEMINI_AI_API_TOKEN;
const PLATFORM_NAME = process.env.PLATFORM_NAME;

const automatedMedias = new AutomatedMedias({
  platformName: PLATFORM_NAME,
  collectionTypes: JELLYFIN_COLLECTION_TYPES,
  qBittorrent: QBITTORRENT_CONFIG,
  jellyfin: {
    server: JELLYFIN_SERVER_URL,
    token: JELLYFIN_X_EMBY_TOKEN,
    userid: JELLYFIN_X_EMBY_TOKEN_USER_ID
  },
  aichat: { ALI_AI_API_TOKEN, GEMINI_AI_API_TOKEN },
  notification: { DINGDING_WEBHOOK_TOKEN }
});

/**
 * 获取请求 data
 *
 * @param {*} req
 * @returns
 */
const getBodyData = req => {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      resolve(JSON.parse(body || '{}'));
    });
  });
};

// 创建服务器
const server = http.createServer(async (req, res) => {
  const setResponse = (data, statusCode = 200) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        code: statusCode,
        message: 'success',
        data
      })
    );
  };

  const parsedUrl = url.parse(req.url, true);
  const { method } = req;
  const { pathname, query: urlQuery = {} } = parsedUrl;
  const query = Object.assign({}, urlQuery);
  const data = await getBodyData(req);
  console.log(`${method.toUpperCase()}：${pathname}`, { query, data });
  switch (pathname) {
    case '/':
      setResponse('Welcome to qBittorrent and jellyfin scraper...');
      break;
    case '/health':
      setResponse('Node Server is up and running...');
      break;
    case '/medias/refresh':
      setResponse(await automatedMedias.refresh(data));
      break;
    case '/medias/scraping':
      setResponse(await automatedMedias.queryRemoteSearch(data));
      break;
    case '/items/refresh':
      setResponse(await automatedMedias.refreshItem(data));
      break;
    case '/items/polling':
      setResponse(await automatedMedias.pollingLibrarysRefresh(data));
      break;
    case '/items/pending':
      setResponse(await automatedMedias.queryPendingFolderItems(data));
      break;
    case '/items/checkNames':
      setResponse(await automatedMedias.checkAndRenameFiles(query, data));
      break;
    default:
      setResponse('Not Found', 404);
      break;
  }
});

// 监听端口
const PORT = process.env.PORT || 30001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
