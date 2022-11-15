import { ServerResponse } from 'http';
import { requestType } from '../../middleware/authentication-user';
import { sendResponse } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { config } from '../../config.js';

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

export const pageGetMyAccount = async (request: requestType, response: ServerResponse): Promise<void> =>
{
  const params: Record<string, unknown> = {};
  if (params == null)
  {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end();
  }

  const errorList = [];
  const usernameKey: string = config.baseKey;
  const validationList: Record<string, string[]> = {
    ...config.validate.base,
    ...config.validate.register,
  };

  if (validationList[usernameKey] == null)
  {
    validationList[usernameKey] = ['isExist'];
  }
  else
  {
    validationList[usernameKey].push('isExist');
  }

  if (config.verifyBaseKey === true)
  {
    if (request.token == null || request.token.loginFiled !== usernameKey)
    {
      sendResponse(response, 200, {
        ok: false,
        description: 'error',
        data: {
          errorList: ['BaseKey doesn\'t verify']
        }
      });
      return;
    }
    else
    {
      params[usernameKey] = request.token.loginValue;
    }
  }

  const input: Record<string, unknown> = {};
  for (const key of config.editable)
  {
    if (params[key] != null)
    {
      input[key] = params[key];
    }
  }

  try
  {
    const user = await ssoTable.findById(
      'user',
      params[usernameKey] as string
    );
    sendResponse(response, 200, {
      ok: true,
      description: `Profile user ${params[usernameKey] as string}`,
      data: user
    });
  }
  catch (error)
  {
    errorList.push((error as Error).message);
    sendResponse(response, 200, {
      ok: false,
      description: 'error',
      data: {
        errorList
      },
    });
  }
};
