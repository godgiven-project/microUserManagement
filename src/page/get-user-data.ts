import { ServerResponse } from 'http';
import { requestType } from '../middleware/authentication-user';
import { sendResponse, bodyParser } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { config } from '../config.js';

const ssoTable = new Database({
  name: 'sso',
  path: config.databasePath,
});

/**
 * Make a code for user that can send to him
 *
 * @property {string} apiKey The User info for send code
 * @property {string} UserId Type of user info
 */
export const pageGetUserData = async (request: requestType, response: ServerResponse): Promise<void> =>
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
  if (
    params.apiKey == null ||
    typeof params.apiKey !== 'string' ||
    params.UserId == null ||
    typeof params.UserId !== 'string'
  )
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
    // Verify token
    try
    {
      await ssoTable.findById(
        'api-key',
        params.apiKey
      );
      try
      {
        const data = await ssoTable.findById(
          'user',
          params.userId
        );

        sendResponse(response, 200, {
          ok: true,
          description: 'data',
          data
        });
      }
      catch
      {
        sendResponse(response, 200, {
          ok: true,
          description: 'error',
          data: {
            errorList: ['UserId is not Exist']
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
