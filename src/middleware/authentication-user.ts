import { ServerResponse } from 'http';
// import * as jwt from './json-web-token.js';
import { config } from '../config.js';
import { Database } from '@godgiven/database/json-file.js';
import type { IncomingMessage } from 'http';

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

interface UserBasic extends Record<string, unknown>
{
  username: string;
  phone?: string;
  email?: string;
}

export interface Token extends Record<string, unknown>
{
  loginFiled: string;
  loginValue: string;
  user: UserBasic;
}

export interface requestType extends IncomingMessage
{
  token?: Token;
}

// define plugin using callbacks
export const authFunction = async (
  request: requestType,
  _reply: ServerResponse
): Promise<requestType> =>
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

  // Verify token
  try
  {
    const data = await ssoTable.findById(
      'token',
      token
    );
    request.token = data as Token;
    return request;
  }
  catch
  {
    return request;
  }
};
