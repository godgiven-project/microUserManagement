import { ServerResponse } from 'http';
import { requestType } from '../middleware/authentication-user';
import { sendResponse, bodyParser } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { config } from '../config.js';

const database = new Database({
  name: 'verification',
  path: config.databasePath,
});
/**
 *
 */
function makeRandomNumber(count: number): number
{
  const min = Math.pow(10, count - 1);
  const max = Math.pow(10, count) - 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Make a code for user that can send to him
 *
 * @property {string} value The User info for send code
 * @property {string} field Type of user info
 */
export const pageMakeVerifyCode = async (request: requestType, response: ServerResponse): Promise<void> =>
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
    if (fieldValue === 'password')
    {
      sendResponse(response, 200, {
        ok: false,
        description: 'error',
        data: {
          errorList: ['Password can not verification']
        },
      });
    }
    try
    {
      await database.save(
        fieldValue.replace(/[/|\\:*?"<>]/g, ''),
        {
          code: makeRandomNumber(config.verifyTokenLength),
          try: 0,
          pass: false
        },
        params.value.replace(/[/|\\:*?"<>]/g, ''),
      );
      sendResponse(response, 200, {
        ok: true,
        description: '..:: Welcome ::..',
      });
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
