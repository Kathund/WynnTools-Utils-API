const { errorMessage, apiMessage } = require('../../../logger.js');
const { apiKey } = require('../../../apiKey.js');
const fs = require('fs');

module.exports = (app) => {
  app.get('/v1/user/list', async (req, res) => {
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/user/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    try {
      apiMessage(
        '/v1/user/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      const userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
      // get all the keys from the object
      const keys = Object.keys(userData);
      return res.status(200).send({ success: true, info: keys });
    } catch (error) {
      errorMessage(error);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
