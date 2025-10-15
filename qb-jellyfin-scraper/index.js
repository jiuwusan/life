const http = require('node:http');
const medias = require('./medias');

// const routes = {
//   "/": () => "Welcome to qBittorrent and jellyfin scraper...",
//   "/health": () => "Node Server is up and running",
// };

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  let resBody = {};
  switch (req.url) {
    case '/':
      resBody = { message: 'Welcome to qBittorrent and jellyfin scraper...' };
      break;
    case '/health':
      resBody = { message: 'Node Server is up and running' };
      break;
    case '/medias/refresh':
      resBody = await medias.refresh(req);
      break;
    default:
      res.statusCode = 404;
      resBody = { message: 'Not Found' };
      break;
  }
  res.end(resBody);
});

const PORT = process.env.PORT || 30001;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
