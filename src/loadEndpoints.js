import { otherMessage, errorMessage } from './logger.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export const loadEndpoints = (directory, app) => {
  try {
    const items = readdirSync(directory);

    let skipped = 0;
    let loaded = 0;

    for (const item of items) {
      const itemPath = join(directory, item);
      const stats = statSync(itemPath);
      if (stats.isDirectory()) {
        const result = loadEndpoints(itemPath, app);
        skipped += result.skipped;
        loaded += result.loaded;
      } else if (item.toLowerCase().endsWith('.js')) {
        if (item.toLowerCase().includes('disabled')) {
          skipped++;
          continue;
        }
        loaded++;
        const route = require(itemPath);
        route(app);
        otherMessage(`Loaded ${itemPath.split('/src/endpoints/')[1].split('.js')[0]} endpoint`);
      }
    }
    return { loaded, skipped };
  } catch (error) {
    errorMessage(`Error loading endpoints: ${error}`);
  }
};
