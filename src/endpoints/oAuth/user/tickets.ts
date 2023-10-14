import type { mongoResponse, user } from '../../../../types.d.ts';
import { sessionSecret, discord } from '../../../../config.json';
import { apiMessage, errorMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import { getUser } from '../../../mongo';
import session from 'express-session';

export default (app: Application) => {
  try {
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
      })
    );

    app.get('/oAuth/user/tickets', async (req: Request, res: Response) => {
      try {
        apiMessage('/oAuth/user/tickets', `User Info requested by ${req.headers['x-forwarded-for']}`);
        const { userData, oauthData } = req.session;
        if (!userData || !oauthData) {
          return res.redirect(discord.url);
        }
        if (userData.id !== oauthData.id) {
          return res.redirect(discord.url);
        }
        const userResponse = (await getUser(userData.id)) as unknown as mongoResponse;
        if (!userResponse.success) {
          return res.status(500).json({ message: 'Internal Server Error' });
        } else {
          const user = userResponse.info as user;
          return res.status(200).json(user.tickets);
        }
      } catch (error: any) {
        errorMessage(`Error while getting user: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error: any) {
    return errorMessage(`Error while getting user: ${error}`);
  }
};
