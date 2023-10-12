import { errorMessage, apiMessage } from '../../logger.js';
import { other, discord } from '../../config.js';
import session from 'express-session';
import { json } from 'body-parser';
import { request } from 'undici';

export default (app) => {
  try {
    app.use(json());
    app.use(
      session({
        secret: other.sessionSecret,
        resave: false,
        saveUninitialized: true,
      })
    );

    app.get('/oAuth/login', async (req, res) => {
      try {
        apiMessage('/oAuth/login', `Login requested by ${req.headers['x-forwarded-for']}`);
        const { code } = req.query;
        if (code) {
          const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
              client_id: discord.clientId,
              client_secret: discord.clientSecret,
              code,
              grant_type: 'authorization_code',
              redirect_uri: discord.redirectUrl,
              scope: 'identify',
            }).toString(),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          var oauthData = await tokenResponseData.body.json();
          req.session.oauthData = oauthData;

          const userResult = await request('https://discord.com/api/users/@me', {
            headers: {
              authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            },
          });
          req.session.userData = await userResult.body.json();
          req.session.oauthData['id'] = req.session.userData.id;
          req.session.oauthData['username'] = req.session.userData.username;
          apiMessage(
            '/oAuth/login',
            `Login successful for ${req.headers['x-forwarded-for']} - Logged in as ${req.session.userData.username} (${req.session.userData.id})`
          );
          if (req.session.ticketId) return res.redirect(`/${req.session.ticketId}.txt`);
          return res.status(200).json({ message: `Logged in successfully as ${req.session.userData.username}` });
        } else {
          if (!oauthData) {
            return res.redirect(discord.url);
          }
        }
      } catch (error) {
        errorMessage(`Error while logging in: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    errorMessage(`Error while logging in: ${error}`);
  }
};
