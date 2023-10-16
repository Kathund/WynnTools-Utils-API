import type { mongoResponse, user, fullTicket } from '../../../types.d.ts';
import { sessionSecret, discord } from '../../../config.json';
import { Application, Request, Response } from 'express';
import { apiMessage, errorMessage } from '../../logger';
import { getUser, getTicket } from '../../mongo';
import session from 'express-session';

export default (app: Application) => {
  app.get('/test', async (req: Request, res: Response) => {
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: true,
        },
      })
    );
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
    const userResponse = (await getUser(id)) as mongoResponse;
    if (!userResponse.success) {
      errorMessage(`Error while getting user: ${userResponse.info} - ${userResponse.error}`);
      return res.status(500).end('Internal Server Error');
    }
    const user = userResponse.info as user;
    if (user.tickets.includes(requestedFileName)) {
      const ticket = (await getTicket(requestedFileName)) as mongoResponse;
      if (!ticket.success) {
        errorMessage(`Error while getting ticket: ${ticket.info} - ${ticket.error}`);
        return res.status(500).end('Internal Server Error');
      }
      const ticketData = ticket.info as fullTicket;
      return res.status(200).json(JSON.stringify(ticketData));
    } else {
      return res.status(403).end('You do not have access to this ticket');
    }
  });
};
