const { errorMessage, apiMessage, otherMessage } = require('./logger.js');
const config = require('../config.json');
const express = require('express');
const fs = require('fs');

try {
  const app = express();

  app.use(express.json(), (req, res, next) => {
    if (req.headers.key !== config.api.key) return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
    return next();
  });

  app.post('/v1/transcript/save', async (req, res) => {
    apiMessage(`/v1/transcript/save has been triggered by ${req.ip} using key ${req.headers.key}`);
    const transcript = req.body;
    if (!transcript) {
      return res.status(400).send({ success: false, cause: 'No transcript provided' });
    }
    var msgSplit = '------------------------------------------------------------';
    var msgStr = `Ticket Id: ${transcript.ticket.id}\n${msgSplit}\nTicket Opened by: ${transcript.ticket.opened.by.username} (${transcript.ticket.opened.by.id})\nOpen Reason: ${transcript.ticket.opened.reason}\nTimestamp: ${transcript.ticket.opened.timestamp}\n\nTicket Closed By: ${transcript.ticket.closed.by.username} (${transcript.ticket.closed.by.id})\nClose Reason: ${transcript.ticket.closed.reason}\nTimestamp: ${transcript.ticket.closed.timestamp}\n${msgSplit}\n\nMessages:\n`;
    transcript.messages.forEach((message) => {
      msgStr += `${message.username} (${message.user}) @ ${message.timestamp}: ${message.content}\n`;
    });

    fs.writeFile(`${config.ticketFolder}/${transcript.ticket.id}.txt`, msgStr, function (err) {
      if (err) throw err;
      apiMessage(`Transcript for ticket ${transcript.ticket.id} has been saved`);
    });
    return res.status(201).send({ success: true, info: 'Transcript saved' });
  });

  app.get('/v1/transcript/get', async (req, res) => {
    const ticketId = req.query.id;
    apiMessage(
      `/v1/transcript/get has been triggered by ${req.ip} using key ${req.headers.key} fetching ticket ${ticketId}`
    );
    if (!ticketId) {
      return res.status(400).send({ success: false, cause: 'No ticketId provided' });
    }
    fs.readFile(`${config.ticketFolder}/${ticketId}.txt`, 'utf8', function (err, data) {
      if (err) {
        return res.status(404).send({ success: false, cause: 'No transcript found' });
      }
      return res.status(200).send({ success: true, info: data });
    });
  });

  app.listen(config.api.PORT, () => {
    otherMessage(`API is now listening on http://localhost:${config.api.PORT}`);
  });
} catch (error) {
  errorMessage(error);
}
