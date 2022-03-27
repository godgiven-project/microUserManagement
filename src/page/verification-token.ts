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

export const pageVerificationToken = async (request: requestType, response: ServerResponse): Promise<void> =>
{
  const params = await bodyParser(request).catch((err) => console.log(err));
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
    const update = await database.insert(
      fieldValue.replace(/[/|\\:*?"<>]/g, ''),
      {
        code: makeRandomNumber(config.verifyTokenLength)
      },
      params.value.replace(/[/|\\:*?"<>]/g, ''),
    );
    sendResponse(response, 200, {
      ok: update === true,
      description: '..:: Welcome ::..',
    });
  }
};
