import { errorMessage, apiMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { apiKey } from '../../../apiKey';
import { readdir } from 'fs';
import { join } from 'path';

export default (app: Application) => {
  app.get('/v1/transcript/list', async (req: Request, res: Response) => {
    apiMessage('/v1/transcript/list', `has been triggered by ${req.headers['x-forwarded-for']}`);
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/transcript/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    readdir(join(__dirname, '../../../../tickets'), (err, files) => {
      if (err) {
        errorMessage(`/v1/transcript/list ${err}`);
        return res.status(500).json({ success: false, cause: 'Internal Server Error' });
      }
      files = files.map((file) => {
        return file.replace('.txt', '');
      });
      apiMessage(
        '/v1/transcript/list',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      return res.status(200).json({ success: true, transcripts: files });
    });
  });
};
