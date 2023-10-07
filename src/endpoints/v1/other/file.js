const { errorMessage, apiMessage } = require('../../../logger.js');
const config = require('../../../../config.json');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  app.get('/:file.txt', (req, res) => {
    apiMessage('/:file.txt', `File ${req.params.file} was requested by ${req.headers['x-forwarded-for']}`);
    const requestedFileName = req.params.file;
    const id = req.query.id;
    if (!id) return res.status(400).end('You are missing an id');
    var userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
    if (!userData[id]) {
      errorMessage(`file ${id} was not found - Requested by ${req.headers['x-forwarded-for']}`);
      return res.status(400).end('You do not have access to this file');
    }
    if (userData[id].tickets.includes(requestedFileName) || userData[id].admin) {
      const filePath = path.join(path.join(__dirname, config.ticketFolder), `${requestedFileName}.txt`);
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile() || path.extname(filePath) !== '.txt') {
          errorMessage(
            `File ${filePath} was requested by ${req.headers['x-forwarded-for']} but was not found with ${id}`
          );
          return res.status(404).end('File not found');
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            errorMessage(`Error reading file: ${err}`);
            return res.status(500).end('Internal Server Error');
          }
          apiMessage(
            '/:file.txt',
            `File ${filePath} was requested by ${req.headers['x-forwarded-for']} and sent with ${id}`
          );
          return res.set('Cache-Control', 'public, max-age=600').status(200).end(data);
        });
      });
    } else {
      return res.status(400).end('You do not have access to this file');
    }
  });
};
