const { otherMessage, errorMessage } = require('./logger.js');
const path = require('path');
const fs = require('fs');

function loadEndpoints(directory, app) {
  try {
    const items = fs.readdirSync(directory);

    let skipped = 0;
    let loaded = 0;

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);
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
}

module.exports = { loadEndpoints };
