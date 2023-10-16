import type { user, fullTicket } from '../types.d.ts';
import { errorMessage, mongoMessage } from './logger';
import { Schema, connect, model } from 'mongoose';
import { mongo } from '../config.json';
import sanitize from 'mongo-sanitize';

export const connectDB = () => {
  connect(mongo.url).then(() => mongoMessage('Connected to MongoDB'));
  return 'Connected to MongoDB';
};

const ticketSchema = new Schema({
  ticket: {
    id: String,
    opened: {
      timestamp: String,
      reason: String,
      by: { id: String, username: String, avatar: String },
    },
    closed: {
      timestamp: String,
      reason: String,
      by: { id: String, username: String, avatar: String },
    },
  },
  messages: [
    {
      username: String,
      id: String,
      timestamp: Number,
      content: String,
      avatar: String,
    },
  ],
});

const userSchema = new Schema({
  id: String,
  username: String,
  admin: Boolean,
  tickets: [String],
});

export const Ticket = model('Ticket', ticketSchema);

export const User = model('User', userSchema);

export const saveTicket = async (ticket: fullTicket) => {
  try {
    ticket = sanitize(ticket);
    const newTicket = new Ticket(ticket);
    await newTicket.save();
    return { success: true, info: 'Saved ticket' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error saving ticket', error: error };
  }
};

export const getTicket = async (id: string) => {
  try {
    id = sanitize(id);
    const ticket = await Ticket.findOne({ 'ticket.id': id });
    if (!ticket) {
      return { success: false, info: 'Ticket does not exist' };
    }
    return { success: true, info: ticket };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error getting ticket', error: error };
  }
};

export const getTickets = async () => {
  const tickets = await Ticket.find();
  return { success: true, info: tickets };
};

export const editTicket = async (id: string, updatedTicket: fullTicket) => {
  try {
    id = sanitize(id);
    updatedTicket = sanitize(updatedTicket);
    await Ticket.findOneAndUpdate({ 'ticket.id': id }, { ticket: updatedTicket });
    return { success: true, info: 'Edited ticket' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error editing ticket', error: error };
  }
};

export const deleteTicket = async (id: string) => {
  try {
    id = sanitize(id);
    await Ticket.findOneAndDelete({ 'ticket.id': id });
    return { success: true, info: 'Deleted ticket' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error deleting ticket', error: error };
  }
};

export const saveUser = async (user: user) => {
  try {
    user = sanitize(user);
    const newUser = new User(user);
    await newUser.save();
    return { success: true, info: 'Saved user' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error saving user', error: error };
  }
};

export const getUser = async (id: string) => {
  try {
    id = sanitize(id);
    const user = await User.findOne({ id: id });
    return { success: true, info: user };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error getting user', error: error };
  }
};

export const getUsers = async () => {
  const users = await User.find();
  return { success: true, info: users };
};

export const editUser = async (id: string, updatedUser: user) => {
  try {
    id = sanitize(id);
    updatedUser = sanitize(updatedUser);
    await User.findOneAndUpdate({ id: id }, updatedUser);
    return { success: true, info: 'Edited user' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error editing user', error: error };
  }
};

export const deleteUser = async (id: string) => {
  try {
    id = sanitize(id);
    await User.findOneAndDelete({ id: id });
    return { success: true, info: 'Deleted user' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error deleting user', error: error };
  }
};
