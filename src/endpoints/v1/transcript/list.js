const { errorMessage, apiMessage } = require('../../../logger.js');
const { apiKey } = require('../../../apiKey.js');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  app.get('/v1/transcript/list', async (req, res) => {
    apiMessage('/v1/transcript/list', `has been triggered by ${req.headers['x-forwarded-for']}`);
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/transcript/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    fs.readdir(path.join(__dirname, '../../../../tickets'), (err, files) => {
      if (err) {
        errorMessage(`/v1/transcript/list ${err}`);
        return res.status(500).json({ success: false, cause: 'Internal Server Error' });
      }
      files = files.map((file) => {
        return file.replace('.txt', '');
      });
      apiMessage(
        '/v1/transcript/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      return res.status(200).json({ success: true, transcripts: files });
    });
  });
};
