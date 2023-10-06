const { errorMessage, apiMessage } = require('../../../logger.js');
const config = require('../../../../config.json');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  app.get('/:file.txt', (req, res) => {
    apiMessage('/:file.txt', `File ${req.params.file} was requested by ${req.socket.remoteAddress}`);
    const requestedFileName = req.params.file;
    const filePath = path.join(path.join(__dirname, config.ticketFolder), `${requestedFileName}.txt`);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile() || path.extname(filePath) !== '.txt') {
        errorMessage(`File ${filePath} was requested by ${req.socket.remoteAddress} but was not found`);
        return res.status(404).end('File not found');
      }

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          errorMessage(`Error reading file: ${err}`);
          return res.status(500).end('Internal Server Error');
        }
        apiMessage('/:file.txt', `File ${filePath} was requested by ${req.socket.remoteAddress} and sent`);
        return res.status(200).end(data);
      });
    });
  });
};
