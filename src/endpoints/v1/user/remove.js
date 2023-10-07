const { errorMessage, apiMessage } = require('../../../logger.js');
const { apiKey } = require('../../../apiKey.js');
const fs = require('fs');

module.exports = (app) => {
  app.delete('/v1/user/remove', async (req, res) => {
    if (!apiKey(req.headers)) {
      apiMessage(
        '/v1/user/remove',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
      );
      return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    }
    const userId = req.query.id;
    try {
      apiMessage(
        '/v1/user/remove',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} removing user ${userId}`
      );
      if (!userId) return res.status(400).send({ success: false, cause: 'No user id provided' });
      const userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
      if (!userData[userId]) {
        apiMessage(
          '/v1/user/remove',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the user ${userId} was not found`
        );
        return res.status(404).send({ success: false, cause: 'User not found' });
      } else {
        delete userData[userId];
        fs.writeFileSync('userData.json', JSON.stringify(userData));
        apiMessage(
          '/v1/user/remove',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} and user ${userId} has been removed`
        );
        return res.status(200).send({ success: true, info: `${userId} has been removed from the database` });
      }
    } catch (error) {
      errorMessage(`Error fetching user ${userId}: ${error}`);
      return res.status(500).send({ success: false, cause: 'Internal Server Error' });
    }
  });
};
