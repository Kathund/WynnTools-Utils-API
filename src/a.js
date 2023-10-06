const { errorMessage, apiMessage, otherMessage, serverMessage, warnMessage } = require('./logger.js');

errorMessage('This is an error message');
apiMessage('This is an api message');
otherMessage('This is an other message');
serverMessage('This is a server message');
warnMessage('This is a warn message');
