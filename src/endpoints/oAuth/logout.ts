import { Application, Request, Response } from 'express';
import { errorMessage, apiMessage } from '../../logger';
import { sessionSecret } from '../../../config.json';
import session from 'express-session';
import { json } from 'body-parser';

export default (app: Application) => {
  try {
    app.use(json());
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

    app.get('/oAuth/logout', async (req: Request, res: Response) => {
      try {
        apiMessage('/oAuth/logout', `Logout requested by ${req.headers['x-forwarded-for']}`);
        req.session.destroy(() => {});
        apiMessage('/oAuth/logout', `Logout successful for ${req.headers['x-forwarded-for']}`);
        return res.status(200).json({ message: 'Logged out successfully' });
      } catch (error: any) {
        errorMessage(`Error while logging in: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error: any) {
    errorMessage(`Error while logging in: ${error}`);
  }
};
