import { Application, Request, Response } from 'express';
import { apiMessage, errorMessage } from '../../logger';
import { readFileSync, readFile, stat } from 'fs';
import { discord } from '../../../config.json';
import { join, extname } from 'path';

export default (app: Application) => {
  app.get('/test', (req: Request, res: Response) => {
    apiMessage('/:file.txt', `File ${req.params.file} was requested by ${req.headers['x-forwarded-for']}`);
    const requestedFileName = req.params.file;
    const { userData, oauthData } = req.session;
    if (!userData || !oauthData) {
      req.session.ticketId = requestedFileName;
      return res.redirect(discord.url);
    }
    if (userData.id !== oauthData.id) {
      req.session.ticketId = requestedFileName;
      return res.redirect(discord.url);
    }
    const id = userData.id;
    if (!id) return res.status(400).end('You are missing an id');
    const userInfo = JSON.parse(readFileSync('userData.json', 'utf8'));
    if (!userInfo[id]) {
      errorMessage(`file ${id} was not found - Requested by ${req.headers['x-forwarded-for']}`);
      return res.status(400).end('You do not have access to this file');
    }
    if (userInfo[id].tickets.includes(requestedFileName) || userInfo[id].admin) {
      const filePath = join(join(__dirname, '../../../tickets'), `${requestedFileName}.txt`);
      stat(filePath, (err, stats) => {
        if (err || !stats.isFile() || extname(filePath) !== '.txt') {
          errorMessage(
            `File ${filePath} was requested by ${req.headers['x-forwarded-for']} but was not found with ${id}`
          );
          return res.status(404).end('File not found');
        }

        readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            errorMessage(`Error reading file: ${err}`);
            return res.status(500).end('Internal Server Error');
          }
          apiMessage(
            '/:file.txt',
            `File ${filePath} was requested by ${req.headers['x-forwarded-for']} and sent with ${id}`
          );
          return res.set('Cache-Control', 'public, max-age=600').status(200).end(data);
        });
      });
    } else {
      return res.status(400).end('You do not have access to this file');
    }
  });
};
