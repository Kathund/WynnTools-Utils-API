import type { transcript, userResult, mongoResponse } from '../../../../types.d.ts';
import { getUser, saveUser, editUser, getTicket, saveTicket } from '../../../mongo';
import { json, Application, Request, Response } from 'express';
import { errorMessage, apiMessage } from '../../../logger';
import { apiKey } from '../../../apiKey';

export default (app: Application) => {
  app.post('/v1/transcript/save', async (req: Request, res: Response) => {
    app.use(json());
    try {
      if (!apiKey(req.headers)) {
        apiMessage(
          '/v1/transcript/save',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
        );
        return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
      }
      apiMessage(
        '/v1/transcript/save',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      const transcript: transcript = req.body;
      if (!transcript) {
        return res.status(400).send({ success: false, cause: 'No transcript provided' });
      }
      const user = (await getUser(transcript.ticket.opened.by.id)) as unknown as userResult;
      if (!user.success) {
        const newUser = await saveUser({
          id: transcript.ticket.opened.by.id,
          username: transcript.ticket.opened.by.username,
          admin: false,
          tickets: [transcript.ticket.id],
        });
        if (!newUser.success) {
          return res.status(400).send({ success: false, cause: 'Failed to save user' });
        }
      } else {
        const editedUser = (await editUser(transcript.ticket.opened.by.id, {
          id: transcript.ticket.opened.by.id,
          username: transcript.ticket.opened.by.username,
          admin: false,
          tickets: [...user.info.tickets, transcript.ticket.id],
        })) as unknown as mongoResponse;
        if (!editedUser.success) {
          return res.status(400).send({ success: false, cause: 'Failed to edit user' });
        }
      }

      const ticket = await getTicket(transcript.ticket.id);
      if (ticket) {
        return res.status(400).send({ success: false, cause: 'Ticket already exists' });
      }
      const newTicket = await saveTicket(transcript.ticket, transcript.messages);
      if (!newTicket.success) {
        return res.status(400).send({ success: false, cause: 'Failed to save ticket' });
      } else {
        return res.status(200).send({ success: true, cause: 'Ticket saved' });
      }
    } catch (error: any) {
      errorMessage(error);
    }
  });
};
