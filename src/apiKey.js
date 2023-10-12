import { api } from './config.js';
export const apiKey = (headers) => {
  if (headers.key === api.key) {
    return true;
  }
};
