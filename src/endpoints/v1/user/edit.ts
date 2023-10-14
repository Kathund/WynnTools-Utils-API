import type { mongoResponse, user } from '../../../../types.d.ts';
import { Application, Request, Response, json } from 'express';
import { errorMessage, apiMessage } from '../../../logger';
import { getUser, editUser } from '../../../mongo';
import { apiKey } from '../../../apiKey';

export default (app: Application) => {
  app.use(json());
  app.patch('/v1/user/edit', async (req: Request, res: Response) => {
    try {
      if (!apiKey(req.headers)) {
        apiMessage(
          '/v1/user/edit',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
        );
        return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
      }
      apiMessage(
        '/v1/user/edit',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      const body = req.body as user;
      const userId = req.query.id as string;
      if (!body) return res.status(400).send({ success: false, cause: 'No body provided' });
      if (!userId) return res.status(400).send({ success: false, cause: 'No user id provided' });
      const user = (await getUser(userId)) as mongoResponse;
      if (!user.success) return res.status(400).send({ success: false, cause: 'User does not exist' });
      const updatedUser = (await editUser(userId, body)) as mongoResponse;
      if (!updatedUser.success) return res.status(400).send({ success: false, cause: 'Error updating user' });
      return res.status(200).send({ success: true, user: updatedUser.info });
    } catch (error: any) {
      errorMessage(error);
      return res.status(500).send({ success: false, cause: 'Internal server error' });
    }
  });
};
