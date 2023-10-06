const { errorMessage, otherMessage } = require('./src/logger.js');
const config = require('./config.json');
const express = require('express');
const path = require('path');
const fs = require('fs');

try {
  const app = express();
  const endpointsDir = path.join(__dirname, 'src', 'endpoints', 'v1');
  errorMessage(endpointsDir);

  var skipped = 0;
  var loaded = 0;
  const endpointFolders = fs.readdirSync(endpointsDir);
  for (const folder of endpointFolders) {
    const endpointsPath = path.join(endpointsDir, folder);
    const endpoints = fs.readdirSync(endpointsPath).filter((file) => file.endsWith('.js'));
    for (const endpoint of endpoints) {
      if (endpoint.toLowerCase().includes('disabled')) {
        skipped++;
        continue;
      }
      loaded++;
      const route = require(path.join(endpointsPath, endpoint));
      route(app);
      otherMessage(`Loaded ${endpoint.split('.js')[0]} endpoint`);
    }
  }
  otherMessage(`Loaded ${loaded} endpoints, skipped ${skipped} endpoints`);

  app.listen(config.api.PORT, () => {
    otherMessage(`Server started on port ${config.api.PORT} @ http://localhost:${config.api.PORT}`);
  });
} catch (error) {
  errorMessage(error);
}
