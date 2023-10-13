export type ticket = {
  id: string;
  opened: { timestamp: number; reason: string; by: { id: string; username: string } };
  closed: { by: { id: string; username: string }; reason: string; timestamp: number };
};

export type message = {
  username: string;
  id: string;
  timestamp: number;
  content: string;
  avatar: string;
};

export type ticketAndMessage = {
  ticket: ticket;
  message: message[];
};

export type user = {
  id: string;
  username: string;
  admin: boolean;
  tickets: string[];
};

export type discordApiUser = {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: null | string;
  accent_color: number;
  global_name: string;
  avatar_decoration_data: null | { asset: string; sku_id: string };
  banner_color: string;
  mfa_enabled: boolean;
  locale: string;
  premium_type: number;
};

export type oauthData = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id?: string;
  username?: string;
};

export declare module 'express-session' {
  interface SessionData {
    oauthData?: oauthData;
    userData?: discordApiUser;
    ticketId?: string;
  }
}

export interface userResult {
  success: boolean;
  info: user;
}

export interface transcript {
  ticket: ticket;
  messages: message[];
}

export type mongoResponse = {
  success: boolean;
  info: string | user | ticket | message[] | ticketAndMessage;
};
