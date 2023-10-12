import { otherMessage, errorMessage } from './logger';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export const loadEndpoints = (directory: string, app: any) => {
  try {
    const items = readdirSync(directory);

    let skipped = 0;
    let loaded = 0;

    for (const item of items) {
      const itemPath = join(directory, item);
      const stats = statSync(itemPath);
      if (stats.isDirectory()) {
        const result = loadEndpoints(itemPath, app);
        if (result) {
          skipped += result.skipped;
          loaded += result.loaded;
        }
      } else if (item.toLowerCase().endsWith('.ts')) {
        if (item.toLowerCase().includes('disabled')) {
          skipped++;
          continue;
        }
        loaded++;
        const route = require(itemPath).default;
        route(app);
        otherMessage(`Loaded ${itemPath.split('\\src\\endpoints\\')[1].split('.ts')[0]} endpoint`);
      }
    }
    return { loaded, skipped };
  } catch (error: any) {
    errorMessage(`Error loading endpoints: ${error}`);
  }
};
