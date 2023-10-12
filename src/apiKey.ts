import { api } from '../config.json';
export const apiKey = (headers: any) => {
  if (headers.key === api.key) {
    return true;
  }
};
