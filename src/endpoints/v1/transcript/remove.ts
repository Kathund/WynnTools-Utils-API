import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { apiKey } from '../../../apiKey';
import { readdir, unlinkSync } from 'fs';
import { join } from 'path';

export default (app: Application) => {
  app.delete('/v1/transcript/remove', async (req: Request, res: Response) => {
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
    let ticketId = req.query.id;
    if (!ticketId) return res.status(400).send({ success: false, cause: 'No ticket id provided' });
    if (typeof ticketId === 'string' && ticketId.includes('.txt')) {
      ticketId = ticketId.replace('.txt', '');
    }
    try {
      apiMessage(
        '/v1/transcript/remove',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} removing ticket ${ticketId}`
      );
      if (!ticketId) return res.status(400).send({ success: false, cause: 'No ticket id provided' });
      readdir(join(__dirname, '../../../../'), (err, files) => {
        if (err) {
          errorMessage(`/v1/transcript/remove ${err}`);
          return res.status(500).json({ success: false, cause: 'Internal Server Error' });
        }
        files = files.map((file) => {
          return file.replace('.txt', '');
        });
        if (files.includes(ticketId as string)) {
          unlinkSync(join(__dirname, '../../../../tickets', `${ticketId}.txt`));
          return res.status(200).send({ success: true, info: `${ticketId} has been removed from the database` });
        } else {
          apiMessage(
            '/v1/transcript/remove',
            `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the ticket ${ticketId} was not found`
          );
          return res.status(404).send({ success: false, cause: 'User not found' });
        }
      });
    } catch (error: any) {
      errorMessage(`Error fetching user ${ticketId}: ${error}`);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
