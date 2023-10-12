import { readdir, writeFile, readFileSync, writeFileSync } from 'fs';
import { errorMessage, apiMessage } from '../../../logger.js';
import { other } from '../../../config.js';
import { apiKey } from '../../../apiKey.js';
import { json } from 'express';
import { join } from 'path';

export default (app) => {
  app.use(json());
  app.post('/v1/transcript/save', async (req, res) => {
    try {
      if (!apiKey(req.headers)) {
        apiMessage(
          '/v1/transcript/save',
          `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key} but the key was invalid`
        );
        return res.status(403).json({ success: false, cause: 'Invalid API-Key' });
      }
      apiMessage(
        '/v1/transcript/save',
        `has been triggered by ${req.headers['x-forwarded-for']} using key ${req.headers.key}`
      );
      const transcript = req.body;
      if (!transcript) {
        return res.status(400).send({ success: false, cause: 'No transcript provided' });
      }
      readdir(join(__dirname, '../../../../tickets'), (err, files) => {
        if (err) {
          errorMessage(`/v1/transcript/list ${err}`);
          return res.status(500).json({ success: false, cause: 'Internal Server Error' });
        }
        files = files.map((file) => {
          return file.replace('.txt', '');
        });
        if (files.includes(transcript.ticket.id)) {
          return res.status(409).send({ success: false, cause: 'Transcript already exists' });
        }
        var msgStr = `Ticket Id: ${transcript.ticket.id}\n${other.msgSplit}\nTicket Opened by: ${transcript.ticket.opened.by.username} (${transcript.ticket.opened.by.id})\nOpen Reason: ${transcript.ticket.opened.reason}\nTimestamp: ${transcript.ticket.opened.timestamp}\n\nTicket Closed By: ${transcript.ticket.closed.by.username} (${transcript.ticket.closed.by.id})\nClose Reason: ${transcript.ticket.closed.reason}\nTimestamp: ${transcript.ticket.closed.timestamp}\n${other.msgSplit}\n\nMessages:\n`;
        transcript.messages.forEach((message) => {
          msgStr += `${message.username} (${message.user}) @ ${message.timestamp}: ${message.content}\n`;
        });

        writeFile(join(join(__dirname, '../../../../tickets'), `${transcript.ticket.id}.txt`), msgStr, function (err) {
          if (err) {
            errorMessage(`Error saving transcript ${transcript.ticket.id}: ${err}`);
            return res.status(500).send({ success: false, cause: 'Error saving transcript' });
          }
          const userData = JSON.parse(readFileSync('userData.json', 'utf8'));
          try {
            if (userData[transcript.ticket.opened.by.id]) {
              var userTickets = userData[transcript.ticket.opened.by.id].tickets;
              userTickets.push(transcript.ticket.id);
              userData[transcript.ticket.opened.by.id].tickets = userTickets;
            } else {
              userData[transcript.ticket.opened.by.id] = {
                id: transcript.ticket.opened.by.id,
                username: transcript.ticket.opened.by.username,
                admin: false,
                tickets: [transcript.ticket.id],
              };
            }
            writeFileSync('userData.json', JSON.stringify(userData));
          } catch (error) {
            errorMessage(`Error saving user data for ${transcript.ticket.opened.by.id}: ${error}`);
          }
          apiMessage('/v1/transcript/save', `Transcript for ticket ${transcript.ticket.id} has been saved`);
          return res.status(201).send({ success: true, info: 'Transcript saved' });
        });
      });
    } catch (error) {
      errorMessage(error);
    }
  });
};
