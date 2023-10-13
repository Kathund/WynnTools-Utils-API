import type { mongoResponse } from '../../../../types.d.ts';
import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { getTicket, deleteTicket } from '../../../mongo';
import { apiKey } from '../../../apiKey';

export default (app: Application) => {
  app.delete('/v1/transcript/remove', async (req: Request, res: Response) => {
    try {
      apiMessage(
        '/v1/transcript/remove',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      if (!apiKey(req.headers)) {
        apiMessage(
          '/v1/transcript/remove',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
        );
        return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
      }
      const ticketId = req.query.id as string;
      if (!ticketId) {
        return res.status(400).send({ success: false, cause: 'No ticketId provided' });
      }
      const ticket = (await getTicket(ticketId)) as unknown as mongoResponse;
      if (!ticket) {
        return res.status(400).send({ success: false, cause: 'Ticket does not exist' });
      }
      const deleteTicketResponse = (await deleteTicket(ticketId)) as unknown as mongoResponse;
      if (!deleteTicketResponse.success) {
        return res.status(500).send({ success: false, cause: 'Failed to delete ticket' });
      }
      return res.status(200).send({ success: true, cause: 'Ticket deleted' });
    } catch (error: any) {
      errorMessage(error);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
