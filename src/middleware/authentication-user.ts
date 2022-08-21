import { ServerResponse } from 'http';
// import * as jwt from './json-web-token.js';
import { config } from '../config.js';
import { Database } from '@godgiven/database/json-file.js';
import type { IncomingMessage } from 'http';

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

interface UserAuth extends Record<string, unknown>
{
  username: string;
  phone?: string;
  email?: string;
}

interface UserBasic extends Record<string, unknown>
{
  username: string;
  phone?: string;
  email?: string;
}

type UserType = UserAuth | UserBasic;

export interface requestType extends IncomingMessage
{
  user?: UserType;
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

  if (config.secretKey == null)
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
    request.user = data.user as UserBasic;
    return request;
  }
  catch
  {
    return request;
  }
};
