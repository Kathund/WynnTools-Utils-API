const { apiMessage, errorMessage } = require('../../../logger.js');
const config = require('../../../../config.json');
const session = require('express-session');
const bodyParser = require('body-parser');
const { request } = require('undici');

module.exports = (app) => {
  try {
    app.use(bodyParser.json());
    app.use(
      session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
      })
    );

    app.get('/oAuth/user/user', async (req, res) => {
      try {
        apiMessage('/oAuth/user', `User Info requested by ${req.headers['x-forwarded-for']}`);
        const { userData, oauthData } = req.session;
        if (!userData || !oauthData) {
          return res.redirect(config.discord.url);
        }
        if (userData.id !== oauthData.id) {
          return res.redirect(config.discord.url);
        }
        const userResult = await request('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
          },
        });
        var user = await userResult.body.json();
        req.session.userData = user;
        req.session.oauthData['id'] = user.id;
        req.session.oauthData['username'] = user.username;
        apiMessage('/oAuth/user', `User Info requested by ${req.headers['x-forwarded-for']} has been sent`);
        return res.status(200).json(user);
      } catch (error) {
        errorMessage(`Error while getting user: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    return errorMessage(`Error while getting user: ${error}`);
  }
};
