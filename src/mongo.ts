import type { user, fullTicket } from '../types.d.ts';
import { errorMessage, mongoMessage } from './logger';
import { Schema, connect, model } from 'mongoose';
import { mongo } from '../config.json';

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
    const newTicket = new Ticket(ticket);
    await newTicket.save();
    return { success: true, info: 'Saved ticket' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error saving ticket' };
  }
};

export const getTicket = async (id: string) => {
  try {
    const ticket = await Ticket.findOne({ 'ticket.id': id });
    if (!ticket) {
      return { success: false, info: 'Ticket does not exist' };
    }
    return { success: true, info: ticket };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error getting ticket' };
  }
};

export const getTickets = async () => {
  const tickets = await Ticket.find();
  return { success: true, info: tickets };
};

export const editTicket = async (id: string, updatedTicket: fullTicket) => {
  try {
    await Ticket.findOneAndUpdate({ 'ticket.id': id }, { ticket: updatedTicket });
    return { success: true, info: 'Edited ticket' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error editing ticket' };
  }
};

export const deleteTicket = async (id: string) => {
  try {
    await Ticket.findOneAndDelete({ 'ticket.id': id });
    return { success: true, info: 'Deleted ticket' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error deleting ticket' };
  }
};

export const saveUser = async (user: user) => {
  const newUser = new User(user);
  await newUser.save();
  return { success: true, info: 'Saved user' };
};

export const getUser = async (id: string) => {
  try {
    const user = await User.findOne({ id: id });
    return { success: true, info: user };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error getting user' };
  }
};

export const getUsers = async () => {
  const users = await User.find();
  return { success: true, info: users };
};

export const editUser = async (id: string, updatedUser: user) => {
  try {
    await User.findOneAndUpdate({ id: id }, updatedUser);
    return { success: true, info: 'Edited user' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error editing user' };
  }
};

export const deleteUser = async (id: string) => {
  try {
    await User.findOneAndDelete({ id: id });
    return { success: true, info: 'Deleted user' };
  } catch (error: any) {
    errorMessage(error);
    return { success: false, info: 'Error deleting user' };
  }
};
