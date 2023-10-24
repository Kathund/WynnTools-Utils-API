import type { mongoResponse } from '../../../../types.d.ts';
import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { getUsers } from '../../../mongo';
import { apiKey } from '../../../apiKey';

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
    const users = (await getUsers()) as unknown as mongoResponse;
    if (!users.success) {
      errorMessage(`Error fetching users: ${users.info}`);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
    return res.status(200).send({ success: true, users: users.info });
  });
};
