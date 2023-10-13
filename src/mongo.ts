import type { ticket, message, user } from '../types.d.ts';
import { errorMessage, mongoMessage } from './logger';
import { Schema, connect, model } from 'mongoose';
import { mongo } from '../config.json';

export const connectDB = () => {
  connect(mongo.url).then(() => mongoMessage('Connected to MongoDB'));
  return 'Connected to MongoDB';
};

const ticketSchema = new Schema({
  id: String,
  opened: { timestamp: Number, reason: String, by: { id: String, username: String } },
  closed: { by: { id: String, username: String }, reason: String, timestamp: Number },
});

const messageSchema = new Schema({
  username: String,
  id: String,
  timestamp: Number,
  content: String,
  avatar: String,
});

const userSchema = new Schema({
  id: String,
  username: String,
  admin: Boolean,
  tickets: [String],
});

const ticketsSchema = new Schema({
  ticketSchema,
  messageSchema,
});

export const Ticket = model('Ticket', ticketsSchema);

export const User = model('User', userSchema);

export const saveTicket = async (ticket: ticket, messages: message[]) => {
  const newTicket = new Ticket({ ticket, messages });
  await newTicket.save();
  return { success: true, info: 'Saved ticket' };
};

export const getTicket = async (id: string) => {
  const ticket = await Ticket.findOne({ 'ticket.id': id });
  return ticket;
};

export const getTickets = async () => {
  const tickets = await Ticket.find();
  return { success: true, info: tickets };
};

export const editTicket = async (id: string, updatedTicket: ticket, updatedMessages: message[]) => {
  await Ticket.findOneAndUpdate(
    { 'ticket.id': id },
    { ticket: updatedTicket, messages: updatedMessages },
    function (err: Error) {
      if (err) {
        errorMessage(err.toString());
        return { success: false, info: 'Error editing ticket' };
      } else {
        return { success: true, info: 'Edited Ticket' };
      }
    }
  );
};

export const deleteTicket = async (id: string) => {
  await Ticket.findOneAndDelete({ 'ticket.id': id }, function (err: Error) {
    if (err) {
      errorMessage(err.toString());
      return { success: false, info: 'Error deleting ticket' };
    } else {
      return { success: true, info: 'Deleted ticket' };
    }
  });
};

export const saveUser = async (user: user) => {
  const newUser = new User(user);
  await newUser.save();
  return { success: true, info: 'Saved user' };
};

export const getUser = async (id: string) => {
  await User.findOne({ id: id }, function (err: Error, user: user) {
    if (err) {
      errorMessage(err.toString());
      return { success: false, info: 'Error getting user' };
    } else {
      return { success: true, info: user };
    }
  });
};

export const getUsers = async () => {
  const users = await User.find();
  return { success: true, info: users };
};

export const editUser = async (id: string, updatedUser: user) => {
  await User.findOneAndUpdate({ id: id }, updatedUser, function (err: Error) {
    if (err) {
      errorMessage(err.toString());
      return { success: false, info: 'Error editing user' };
    } else {
      return { success: true, info: 'Edited user' };
    }
  });
};

export const deleteUser = async (id: string) => {
  await User.findOneAndDelete({ id: id }, function (err: Error) {
    if (err) {
      errorMessage(err.toString());
      return { success: false, info: 'Error deleting user' };
    } else {
      return { success: true, info: 'Deleted user' };
    }
  });
};
