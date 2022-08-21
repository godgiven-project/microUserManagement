import { ServerResponse } from 'http';
import * as crypto from 'crypto';
import { createId } from '@godgiven/util/uuid.js';
import { requestType } from '../middleware/authentication-user';
import { sendResponse, bodyParser } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { config } from '../config.js';

export const md5 = (contents: string): string => crypto.createHash('md5').update(contents).digest('hex');

const verifyTable = new Database({
  name: 'verification',
  path: config.databasePath,
});

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

/**
 * Make a code for user that can send to him
 *
 * @property {string} value The User info for send code
 * @property {string} field Type of user info
 * @property {string} code The User info for send code
 */
export const pageLogin = async (request: requestType, response: ServerResponse): Promise<void> =>
{
  const params = await bodyParser(request);
  if (params == null)
  {
    sendResponse(response, 200, {
      ok: false,
      description: '..:: Welcome ::..',
      data: {
        errorList: ['ParamsIsEmpty']
      },
    });
    return;
  }
  if (params.value == null || typeof params.value !== 'string')
  {
    sendResponse(response, 200, {
      ok: false,
      description: '..:: Welcome ::..',
      data: {
        errorList: ['ParamsIsNotValid']
      },
    });
  }
  else
  {
    let fieldValue: string = 'phone';
    if (params.field != null && typeof params.field === 'string')
    {
      fieldValue = params.field;
    }

    let user: any = {};
    try
    {
      user = await ssoTable.findById(
        fieldValue.replace(/[/|\\:*?"<>]/g, ''),
        params.value.replace(/[/|\\:*?"<>]/g, '')
      );
    }
    catch
    {
      sendResponse(response, 200, {
        ok: false,
        description: 'User not exist',
      });
      return;
    }
    try
    {
      const data = await verifyTable.findById(
        'password',
        user.id
      );
      if (data.code === md5(params.code))
      {
        const id = createId();
        await ssoTable.insert(
          'token',
          {
            user,
            loginFiled: fieldValue.replace(/[/|\\:*?"<>]/g, ''),
            loginValue: params.value.replace(/[/|\\:*?"<>]/g, '')
          },
          id
        );
        sendResponse(response, 200, {
          ok: true,
          description: '..:: Welcome ::..',
          data: {
            token: id
          }
        });
      }
      else
      {
        await verifyTable.updateById(
          fieldValue.replace(/[/|\\:*?"<>]/g, ''),
          {
            ...data,
            try: (data.try as number + 1)
          },
          params.value.replace(/[/|\\:*?"<>]/g, '')
        );
        sendResponse(response, 200, {
          ok: false,
          description: 'Its` not correct',
        });
      }
    }
    catch (error: any)
    {
      sendResponse(response, 200, {
        ok: false,
        description: error.code,
      });
    }
  }
};
