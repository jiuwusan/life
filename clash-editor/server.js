const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8090;
const STATIC_DIR = path.join(__dirname, 'public');
const YAML_WHITELIST = ['AceMixes.yaml'];

function getConfigDir() {
  const args = process.argv.slice(2); // 去除前两个 node 和 app.js
  for (const arg of args) {
    if (arg.startsWith('--config-dir=')) {
      return arg.split('=')[1];
    }
    // 支持 --config-dir /path/to/config 的形式
    if (arg === '--config-dir') {
      const index = args.indexOf(arg);
      return args[index + 1]; // 下一个参数作为路径
    }
  }
  return ''; // 未提供
}

function getYamlPath(filename) {
  if (!YAML_WHITELIST.includes(filename)) return null;
  const configDir = getConfigDir();
  return configDir ? path.join(configDir, filename) : path.join(__dirname, 'config', filename);
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filepath, contentType = 'text/plain') {
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filepath).pipe(res);
}

function handleView(req, res, query) {
  const filename = query.file;
  const filepath = getYamlPath(filename);
  if (!filepath) return sendJson(res, { error: '非法文件' });

  const lines = fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf8').split('\n') : [];

  sendJson(res, { lines });
}

function handleEdit(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    try {
      const { file, keyword, action, content } = JSON.parse(body);
      const filepath = getYamlPath(file);
      if (!filepath) return sendJson(res, { error: '非法文件' });

      let lines = fs.readFileSync(filepath, 'utf8').split('\n');
      const index = lines.findIndex(line => line.includes(keyword));
      if (index === -1) return sendJson(res, { error: '未找到关键词' });

      if (action === 'insert') {
        lines.splice(index + 1, 0, content || '');
      } else if (action === 'replace') {
        if (index + 1 < lines.length) lines[index + 1] = content || '';
      } else if (action === 'delete') {
        if (index + 1 < lines.length) lines.splice(index + 1, 1);
      }

      fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
      sendJson(res, { success: true, lines });
    } catch (err) {
      sendJson(res, { error: err.message }, 500);
    }
  });
}

function handleFiles(res) {
  // 返回 YAML 文件名列表
  sendJson(res, YAML_WHITELIST);
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  const method = req.method;

  // 路由分发
  if (method === 'GET' && pathname === '/') {
    return sendFile(res, path.join(STATIC_DIR, 'index.html'), 'text/html; charset=utf-8');
  }
  if (method === 'GET' && pathname === '/view') {
    return handleView(req, res, query);
  }
  if (method === 'POST' && pathname === '/edit') {
    return handleEdit(req, res);
  }
  if (method === 'GET' && pathname === '/files') {
    return handleFiles(res);
  }

  // 静态资源处理
  const filePath = path.join(STATIC_DIR, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css'
      }[ext] || 'text/plain';

    return sendFile(res, filePath, mime);
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`✅ 服务运行中：http://localhost:${PORT}`);
});
