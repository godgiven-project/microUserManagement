import { ServerResponse } from 'http';
import * as jwt from './json-web-token.js';
import { config } from '../config.js';
import type { IncomingMessage } from 'http';

interface UserAuth extends Record<string, unknown>
{
  username: string;
  password: string;
  phone?: string;
  email?: string;
}

interface UserBasic extends Record<string, unknown>
{
  username: string;
  password: string;
  phone?: string;
  email?: string;
}

type UserType = UserAuth | UserBasic;

export interface requestType extends IncomingMessage
{
  user?: UserType;
}

// define plugin using callbacks
export const authFunction = (request: requestType, _reply: ServerResponse): requestType =>
{
  const authHeader = request.headers.authorization;
  let token = '';

  // Giv token and secret
  if (authHeader != null)
  {
    // Set token and secret
    token = authHeader.split(' ')[1];
  }
  else
  {
    return request;
  }

  if (config.secretKey == null)
  {
    return request;
  }

  // Verify token
  try
  {
    request.user = jwt.verify(token, config.secretKey) as typeof request.user;
    return request;
  }
  catch
  {
    return request;
  }
};
