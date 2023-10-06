const config = require('../config.json');
module.exports = {
  apiKey: (headers) => {
    if (headers.key === config.api.key) {
      return true;
    }
  },
};
