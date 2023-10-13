import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { apiKey } from '../../../apiKey';
import { readFileSync } from 'fs';

export default (app: Application) => {
  app.get('/v1/user/list', async (req: Request, res: Response) => {
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
    } catch (error: any) {
      errorMessage(error);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
