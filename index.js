const { errorMessage, otherMessage } = require('./src/logger.js');
const { loadEndpoints } = require('./src/loadEndpoints.js');
const config = require('./config.json');
const express = require('express');
const path = require('path');

const app = express();

try {
  app.get('/', async (req, res) => {
    return res.redirect(config.discord.url);
  });

  const endpointsDir = path.join(__dirname, 'src', 'endpoints');
  const result = loadEndpoints(endpointsDir, app);
  otherMessage(`Loaded ${result.loaded} endpoints, skipped ${result.skipped} endpoints`);

  app.listen(config.api.PORT, () => {
    otherMessage(`Server started on port ${config.api.PORT} @ http://localhost:${config.api.PORT}`);
  });
} catch (error) {
  errorMessage(`Error starting server: ${error}`);
}
