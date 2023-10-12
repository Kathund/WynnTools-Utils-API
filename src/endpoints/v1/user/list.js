import { errorMessage, apiMessage } from '../../../logger.js';
import { apiKey } from '../../../apiKey.js';
import { readFileSync } from 'fs';

export default (app) => {
  app.get('/v1/user/list', async (req, res) => {
    apiMessage('/v1/user/list', `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`);
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/user/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    try {
      const userData = JSON.parse(readFileSync('userData.json', 'utf8'));
      const keys = Object.keys(userData);
      return res.status(200).send({ success: true, info: keys });
    } catch (error) {
      errorMessage(error);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
