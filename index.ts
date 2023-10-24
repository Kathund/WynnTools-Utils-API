import express, { Request, Response } from 'express';
import { loadEndpoints } from './src/loadEndpoints';
import mongoSanitize from 'express-mongo-sanitize';
import { discord, api } from './config.json';
import { otherMessage } from './src/logger';
import { connectDB } from './src/mongo';
import { join } from 'path';

const app = express();

try {
  app.use(mongoSanitize());
  app.get('/', async (req: Request, res: Response) => {
    return res.redirect(discord.url);
  });

  const endpointsDir = join(__dirname, 'src', 'endpoints');
  const result = loadEndpoints(endpointsDir, app);
  if (result !== undefined) {
    otherMessage(`Loaded ${result.loaded} endpoints, skipped ${result.skipped} endpoints`);
  } else {
    otherMessage(`No endpoints found in ${endpointsDir}`);
  }

  connectDB();

  app.listen(api.PORT, () => {
    otherMessage(`Server started on port ${api.PORT} @ http://localhost:${api.PORT}`);
  });
} catch (error: any) {
  otherMessage(`Error starting server: ${error}`);
}
