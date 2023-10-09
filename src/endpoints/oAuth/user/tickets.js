const { apiMessage, errorMessage } = require('../../../logger.js');
const config = require('../../../../config.json');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');

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

    app.get('/oAuth/user/tickets', async (req, res) => {
      try {
        apiMessage('/oAuth/user', `User Info requested by ${req.headers['x-forwarded-for']}`);
        const { userData, oauthData } = req.session;
        if (!userData || !oauthData) {
          return res.redirect(config.discord.url);
        }
        if (userData.id !== oauthData.id) {
          return res.redirect(config.discord.url);
        }
        const userInfo = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
        if (!userInfo) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!userInfo[userData.id]) {
          return res.status(404).json({ message: 'You do not have any tickets' });
        }
        return res.status(200).json({ success: true, tickets: userInfo[userData.id].tickets });
      } catch (error) {
        errorMessage(`Error while getting user: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    return errorMessage(`Error while getting user: ${error}`);
  }
};
