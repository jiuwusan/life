const http = require("node:http");

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  let resBody = {};
  switch (req.url) {
    case "/":
      resBody = { message: "Hello from Node.js v22!" };
      break;
    case "/health":
      resBody = { message: "Node Server is up and running" };
      break;
    default:
      res.statusCode = 404;
      resBody = { message: "Not Found" };
      break;
  }
  resBody.code = res.statusCode;
  res.end(JSON.stringify(resBody));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
