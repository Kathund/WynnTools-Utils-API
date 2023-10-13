import type { transcript, mongoResponse } from '../../../../types.d.ts';
import { json, Application, Request, Response } from 'express';
import { errorMessage, apiMessage } from '../../../logger';
import { getTicket, editTicket } from '../../../mongo';
import { apiKey } from '../../../apiKey';

export default (app: Application) => {
  app.use(json());
  app.patch('/v1/transcript/edit', async (req: Request, res: Response) => {
    try {
      if (!apiKey(req.headers)) {
        apiMessage(
          '/v1/transcript/edit',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
        );
        return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
      }
      apiMessage(
        '/v1/transcript/edit',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      const ticketId = req.query.id as string;
      if (!ticketId) {
        return res.status(400).send({ success: false, cause: 'No ticket id provided' });
      }
      const transcript: transcript = req.body;
      if (!transcript) {
        return res.status(400).send({ success: false, cause: 'No transcript provided' });
      }
      const ticket = (await getTicket(ticketId)) as unknown as mongoResponse;
      if (!ticket.success) {
        return res.status(400).send({ success: false, cause: 'Ticket does not exist' });
      }
      const editedTicket = (await editTicket(
        ticketId,
        transcript.ticket,
        transcript.messages
      )) as unknown as mongoResponse;
      if (!editedTicket.success) {
        return res.status(400).send({ success: false, cause: 'Failed to edit ticket' });
      }
      return res.status(200).send({ success: true, cause: 'Ticket edited' });
    } catch (error: any) {
      errorMessage(error);
      return res.status(500).send({ success: false, cause: 'Internal server error' });
    }
  });
};
