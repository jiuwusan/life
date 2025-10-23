const http = require('node:http');
const url = require('node:url');
const medias = require('./medias');

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
      setResponse(await medias.refresh(data));
      break;
    case '/medias/scraping':
      setResponse(await medias.queryRemoteSearch(data));
      break;
    case '/items/refresh':
      setResponse(await medias.refreshItem(data));
      break;
    case '/items/polling':
      setResponse(await medias.pollingLibrarysRefresh(data));
      break;
    case '/items/pending':
      setResponse(await medias.queryPendingFolderItems(data));
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
