import { ServerResponse } from 'http';
import { createId } from '@godgiven/util/uuid.js';
import { requestType } from '../middleware/authentication-user';
import { sendResponse, bodyParser } from '@godgiven/type-server';
import { Database } from '@godgiven/database/json-file.js';
import { config } from '../config.js';

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
 * @property {boolean} checkUser Check user information
 */
export const pageVerify = async (request: requestType, response: ServerResponse): Promise<void> =>
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

    try
    {
      const data = await verifyTable.findById(
        fieldValue.replace(/[/|\\:*?"<>]/g, ''),
        params.value.replace(/[/|\\:*?"<>]/g, '')
      );
      if (fieldValue === 'password')
      {
        sendResponse(response, 200, {
          ok: false,
          description: 'Password can not verification',
        });
        return;
      }
      if (data.code === params.code)
      {
        let userExist = false;
        let user = {};
        if (params.checkUser === true)
        {
          try
          {
            user = await ssoTable.findById(
              fieldValue.replace(/[/|\\:*?"<>]/g, ''),
              params.value.replace(/[/|\\:*?"<>]/g, '')
            );
            userExist = true;
          }
          catch
          {
            userExist = false;
          }
        }
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
            userExist,
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
