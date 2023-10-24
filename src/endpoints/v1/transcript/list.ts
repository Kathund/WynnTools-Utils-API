import type { mongoResponse } from '../../../../types.d.ts';
import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { getTickets } from '../../../mongo';
import { apiKey } from '../../../apiKey';

export default (app: Application) => {
  app.get('/v1/transcript/list', async (req: Request, res: Response) => {
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/transcript/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    apiMessage(
      '/v1/transcript/list',
      `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
    );
    const tickets = (await getTickets()) as unknown as mongoResponse;
    if (!tickets.success) {
      errorMessage(`Failed to fetch tickets`);
      return res.status(400).send({ success: false, cause: 'Failed to fetch tickets' });
    }
    return res.status(200).send({ success: true, info: 'Tickets fetched', tickets: tickets.info });
  });
};
