import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { apiKey } from '../../../apiKey';
import { readFileSync } from 'fs';

export default (app: Application) => {
  app.get('/v1/user/get', async (req: Request, res: Response) => {
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/user/get',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    const userId = req.query.id as string;
    try {
      apiMessage(
        '/v1/user/get',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} fetching user ${userId}`
      );
      if (!userId) return res.status(400).send({ success: false, cause: 'No user id provided' });
      const userData = JSON.parse(readFileSync('userData.json', 'utf8'));
      if (!userData[userId]) {
        apiMessage(
          '/v1/user/get',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the user ${userId} was not found`
        );
        return res.status(404).send({ success: false, cause: 'User not found' });
      } else {
        apiMessage(
          '/v1/user/get',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} and sent user ${userId}`
        );
        return res.status(200).send({ success: true, info: userData[userId] });
      }
    } catch (error: any) {
      errorMessage(`Error fetching user ${userId}: ${error}`);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
