import { errorMessage, otherMessage } from './src/logger.js';
import { loadEndpoints } from './src/loadEndpoints.js';
import { discord, api } from './src/config.js';
import express from 'express';
import { join } from 'path';

const app = express();

try {
  app.get('/', async (req, res) => {
    return res.redirect(discord.url);
  });

  const endpointsDir = join(__dirname, 'src', 'endpoints');
  const result = loadEndpoints(endpointsDir, app);
  otherMessage(`Loaded ${result.loaded} endpoints, skipped ${result.skipped} endpoints`);

  app.listen(api.PORT, () => {
    otherMessage(`Server started on port ${api.PORT} @ http://localhost:${api.PORT}`);
  });
} catch (error) {
  errorMessage(`Error starting server: ${error}`);
}
