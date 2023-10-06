const { errorMessage, apiMessage } = require('../../../logger.js');
const config = require('../../../../config.json');
const { apiKey } = require('../../../apiKey.js');
const express = require('express');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  app.use(express.json());
  app.post('/v1/transcript/save', async (req, res) => {
    try {
      if (!apiKey(req.headers)) {
        apiMessage(
          '/v1/transcript/save',
          `has been triggered by ${req.socket.remoteAddress} using key ${req.headers.key} but the key was invalid`
        );
        return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
      }
      apiMessage(
        '/v1/transcript/save',
        `has been triggered by ${req.socket.remoteAddress} using key ${req.headers.key}`
      );
      const transcript = req.body;
      if (!transcript) {
        return res.status(400).send({ success: false, cause: 'No transcript provided' });
      }
      var msgSplit = '------------------------------------------------------------';
      var msgStr = `Ticket Id: ${transcript.ticket.id}\n${msgSplit}\nTicket Opened by: ${transcript.ticket.opened.by.username} (${transcript.ticket.opened.by.id})\nOpen Reason: ${transcript.ticket.opened.reason}\nTimestamp: ${transcript.ticket.opened.timestamp}\n\nTicket Closed By: ${transcript.ticket.closed.by.username} (${transcript.ticket.closed.by.id})\nClose Reason: ${transcript.ticket.closed.reason}\nTimestamp: ${transcript.ticket.closed.timestamp}\n${msgSplit}\n\nMessages:\n`;
      transcript.messages.forEach((message) => {
        msgStr += `${message.username} (${message.user}) @ ${message.timestamp}: ${message.content}\n`;
      });

      fs.writeFile(
        path.join(path.join(__dirname, config.ticketFolder), `${transcript.ticket.id}.txt`),
        msgStr,
        function (err) {
          if (err) {
            errorMessage(`Error saving transcript ${transcript.ticket.id}: ${err}`);
            return res.status(500).send({ success: false, cause: 'Error saving transcript' });
          }
          apiMessage('/v1/transcript/save', `Transcript for ticket ${transcript.ticket.id} has been saved`);
          return res.status(201).send({ success: true, info: 'Transcript saved' });
        }
      );
    } catch (error) {
      errorMessage(error);
    }
  });
};
