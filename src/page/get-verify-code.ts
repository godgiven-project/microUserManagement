import { ServerResponse } from 'http';
import { requestType } from '../middleware/authentication-user';
import { sendResponse, bodyParser } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { config } from '../config.js';

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

const database = new Database({
  name: 'verification',
  path: config.databasePath,
});

/**
 * Make a code for user that can send to him
 *
 * @property {string} apiKey A key for external server
 * @property {string} field The User info for send code
 * @property {string} value Type of user info
 */
export const pageGetVerifyCode = async (request: requestType, response: ServerResponse): Promise<void> =>
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

  if (
    params.apiKey == null ||
    typeof params.apiKey !== 'string' ||
    params.value == null ||
    typeof params.value !== 'string'
  )
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
    // Verify token
    try
    {
      await ssoTable.findById(
        'api-key',
        params.apiKey
      );
      try
      {
        let fieldValue: string = 'phone';
        if (params.field != null && typeof params.field === 'string')
        {
          fieldValue = params.field;
        }
        const data = await database.findById(
          fieldValue.replace(/[/|\\:*?"<>]/g, ''),
          params.value.replace(/[/|\\:*?"<>]/g, ''),
        );

        sendResponse(response, 200, {
          ok: true,
          description: 'data',
          data: {
            code: data.code
          }
        });
      }
      catch
      {
        sendResponse(response, 200, {
          ok: true,
          description: 'error',
          data: {
            errorList: ['Value is not Exist']
          }
        });
      }
    }
    catch
    {
      sendResponse(response, 200, {
        ok: true,
        description: 'error',
        data: {
          errorList: ['Api Key is not Valid']
        }
      });
    }
  }
};
