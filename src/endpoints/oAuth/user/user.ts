import { sessionSecret, discord } from '../../../../config.json';
import type { discordApiUser } from '../../../../types.d.ts';
import { apiMessage, errorMessage } from '../../../logger';
import { Application, Request, Response } from 'express';
import session from 'express-session';
import { json } from 'body-parser';
import { request } from 'undici';

export default (app: Application) => {
  try {
    app.use(json());
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
      })
    );

    app.get('/oAuth/user/user', async (req: Request, res: Response) => {
      try {
        apiMessage('/oAuth/user', `User Info requested by ${req.headers['x-forwarded-for']}`);
        const { userData, oauthData } = req.session;
        if (!userData || !oauthData) {
          return res.redirect(discord.url);
        }
        if (userData.id !== oauthData.id) {
          return res.redirect(discord.url);
        }
        const userResult = await request('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
          },
        });
        const user = (await userResult.body.json()) as discordApiUser;
        req.session.userData = user;
        oauthData['id'] = user.id;
        oauthData['username'] = user.username;
        apiMessage('/oAuth/user', `User Info requested by ${req.headers['x-forwarded-for']} has been sent`);
        return res.status(200).json(user);
      } catch (error: any) {
        errorMessage(`Error while getting user: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error: any) {
    return errorMessage(`Error while getting user: ${error}`);
  }
};
