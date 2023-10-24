import type { mongoResponse } from '../../../../types.d.ts';
import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { getTicket } from '../../../mongo';
import { apiKey } from '../../../apiKey';

export default (app: Application) => {
  app.get('/v1/transcript/get', async (req: Request, res: Response) => {
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/transcript/get',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    const ticketId = req.query.id as string;
    apiMessage(
      '/v1/transcript/get',
      `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} fetching ticket ${ticketId}`
    );
    if (!ticketId) {
      errorMessage(`No ticketId provided by ${req.headers['x-forwarded-for']}`);
      return res.status(400).send({ success: false, cause: 'No ticketId provided' });
    }
    const ticket = (await getTicket(ticketId)) as unknown as mongoResponse;
    if (!ticket.success) {
      errorMessage(`Ticket ${ticketId} does not exist`);
      return res.status(400).send({ success: false, cause: 'Ticket does not exist' });
    }
    return res.status(200).send({ success: true, ticket: ticket.info });
  });
};
