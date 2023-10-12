import { errorMessage, apiMessage } from '../../../logger';
import { apiKey } from '../../../apiKey';
import { readFile } from 'fs';
import { join } from 'path';

export default (app: any) => {
  app.get('/v1/transcript/get', async (req: any, res: any) => {
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/transcript/get',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    const ticketId = req.query.id;
    apiMessage(
      '/v1/transcript/get',
      `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} fetching ticket ${ticketId}`
    );
    if (!ticketId) {
      errorMessage(`No ticketId provided by ${req.headers['x-forwarded-for']}`);
      return res.status(400).send({ success: false, cause: 'No ticketId provided' });
    }
    readFile(join(join(__dirname, '../../../../tickets'), `${ticketId}.txt`), 'utf8', function (err, data) {
      if (err) {
        errorMessage(`Error viewing transcript ${ticketId}: ${err}`);
        return res.status(404).send({ success: false, cause: 'No transcript found' });
      }
      apiMessage(
        '/v1/transcript/get',
        `Transcript for ticket ${ticketId} has been sent to ${req.headers['x-forwarded-for']}`
      );
      return res.status(200).send({ success: true, info: data });
    });
  });
};
