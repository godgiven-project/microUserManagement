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
 * @property {string} value The User info for send code
 * @property {string} field Type of user info
 */
export const pageVerifyToken = async (request: requestType, response: ServerResponse): Promise<void> =>
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
    params.token == null ||
    typeof params.token !== 'string'
    // ||
    // params.apiKey == null ||
    // typeof params.apiKey !== 'string'
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
    // try
    // {
    //   await ssoTable.findById(
    //     'api-key',
    //     params.apiKey
    //   );

    try
    {
      const data = await ssoTable.findById(
        'token',
        params.token
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
          errorList: ['Token is not Valid']
        }
      });
    }
    // }
    // catch
    // {
    //   sendResponse(response, 200, {
    //     ok: true,
    //     description: 'error',
    //     data: {
    //       errorList: ['Api Key is not Valid']
    //     }
    //   });
    // }
  }
};
