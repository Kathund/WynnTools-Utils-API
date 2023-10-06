const { otherMessage, serverMessage, errorMessage } = require('./logger.js');
const config = require('../config.json');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const filePath = path.join(path.join(__dirname, config.ticketFolder), req.url.slice(1));
  fs.stat(filePath, (err, stats) => {
    if (err) {
      errorMessage(`Error checking file existence: ${err}`);
      return res.end('File not found').writeHead(404, { 'Content-Type': 'text/plain' });
    }
    if (stats.isFile() && path.extname(filePath) === '.txt') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          errorMessage(`Error reading file: ${err}`);
          return res.end('Internal Server Error').writeHead(500, { 'Content-Type': 'text/plain' });
        }
        serverMessage(`File ${filePath} was requested by ${req.ip} and sent`);
        return res.end(data).writeHead(200, { 'Content-Type': 'text/plain' });
      });
    } else {
      errorMessage(`File ${filePath} was requested by ${req.ip} but was not found`);
      return res.end('File not found').writeHead(404, { 'Content-Type': 'text/plain' });
    }
  });
});

server.listen(config.server.PORT, () => {
  otherMessage(`Server started on port ${config.server.PORT} @ $ http://localhost:${config.server.PORT}`);
});
