import { sessionSecret, discord } from '../../../../config.json';
import { apiMessage, errorMessage } from '../../../logger.js';
import session from 'express-session';
import { json } from 'body-parser';
import { readFileSync } from 'fs';

export default (app: any) => {
  try {
    app.use(json());
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
      })
    );

    app.get('/oAuth/user/tickets', async (req: any, res: any) => {
      try {
        apiMessage('/oAuth/user', `User Info requested by ${req.headers['x-forwarded-for']}`);
        const { userData, oauthData } = req.session;
        if (!userData || !oauthData) {
          return res.redirect(discord.url);
        }
        if (userData.id !== oauthData.id) {
          return res.redirect(discord.url);
        }
        const userInfo = JSON.parse(readFileSync('userData.json', 'utf8'));
        if (!userInfo) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!userInfo[userData.id]) {
          return res.status(404).json({ message: 'You do not have any tickets' });
        }
        return res.status(200).json({ success: true, tickets: userInfo[userData.id].tickets });
      } catch (error: any) {
        errorMessage(`Error while getting user: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error: any) {
    return errorMessage(`Error while getting user: ${error}`);
  }
};
