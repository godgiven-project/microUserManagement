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
  let params: Record<string, unknown> = {};
  try
  {
    params = await bodyParser(request);
  }
  catch
  {
    sendResponse(response, 200, {
      ok: false,
      description: 'error',
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
      description: 'error',
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

    let user: Record<string, unknown> | null = null;
    try
    {
      user = await ssoTable.findById(
        // fieldValue.replace(/[/|\\:*?"<>]/g, ''), TODO: we should make index for this.
        'user',
        params.value.replace(/[/|\\:*?"<>]/g, '')
      );
    }
    catch
    {
      sendResponse(response, 200, {
        ok: false,
        description: 'error',
        data: {
          errorList: ['User not exist']
        }
      });
      return;
    }
    try
    {
      const data = await verifyTable.findById(
        'password',
        user._id as string
      );
      if (
        params.code != null &&
        typeof params.code === 'string' &&
        data.code === md5(params.code)
      )
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
          description: 'data',
          data: {
            token: id
          }
        });
      }
      else
      {
        await verifyTable.updateById(
          // fieldValue.replace(/[/|\\:*?"<>]/g, ''),
          'password',
          {
            ...data,
            try: (data.try as number + 1)
          },
          params.value.replace(/[/|\\:*?"<>]/g, '')
        );
        sendResponse(response, 200, {
          ok: true,
          description: 'error',
          data: {
            errorList: ['Its` not correct']
          }
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
