// import { errorMessage } from './logger.js';
import { readFileSync } from 'fs';

export const getConfig = () => {
  return JSON.parse(readFileSync('config.json', 'utf8'));
};

export const config = getConfig();
export const api = config.api;
export const discord = config.discord;
export const other = config.other;
