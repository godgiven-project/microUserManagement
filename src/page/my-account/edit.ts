import { ServerResponse } from 'http';
import { requestType } from '../../middleware/authentication-user';
import { sendResponse, bodyParser } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { validate } from '@godgiven/validator';
import { config } from '../../config.js';

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

type validateKey = keyof typeof validate;

export const pageEditMyAccount = async (request: requestType, response: ServerResponse): Promise<void> =>
{
  const params = await bodyParser(request);
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

  for (const key in validationList)
  {
    for (const validateKey of validationList[key])
    {
      if (validate[validateKey as validateKey] == null) { continue; }
      if (validate[validateKey as validateKey](params[key]) === false)
      {
        errorList.push(`${key}${validateKey}`);
      }
    }
  }
  if (errorList.length > 0)
  {
    sendResponse(response, 200, {
      ok: false,
      description: 'error',
      data: {
        errorList
      },
    });
    return;
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
    await ssoTable.updateById(
      'user',
      input,
      params[usernameKey]
    );
    sendResponse(response, 200, {
      ok: true,
      description: `Profile user ${params[usernameKey] as string} updated`,
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
