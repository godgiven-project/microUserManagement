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
export const pageVerifyCode = async (request: requestType, response: ServerResponse): Promise<void> =>
{
  const params = await bodyParser(request);
  if (params == null)
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

    try
    {
      if (fieldValue === 'password')
      {
        sendResponse(response, 200, {
          ok: false,
          description: 'error',
          data: {
            errorList: ['Password can not verification']
          }
        });
        return;
      }
      const data = await verifyTable.findById(
        fieldValue.replace(/[/|\\:*?"<>]/g, ''),
        params.value.replace(/[/|\\:*?"<>]/g, '')
      );
      if (data.code === params.code)
      {
        if (data.pass === true)
        {
          sendResponse(response, 200, {
            ok: false,
            description: 'error',
            data: {
              errorList: ['Code is expire']
            }
          });
        }
        await verifyTable.updateById(
          fieldValue.replace(/[/|\\:*?"<>]/g, ''),
          {
            ...data,
            pass: true,
          },
          params.value.replace(/[/|\\:*?"<>]/g, '')
        );
        let userExist = false;
        let user: Record<string, unknown> | null = null;
        if (params.checkUser === true)
        {
          try
          {
            user = await ssoTable.findById(
              // fieldValue.replace(/[/|\\:*?"<>]/g, ''), TODO: we should make index for this.
              'user',
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
          description: 'data',
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
        description: 'error',
        data: {
          errorList: [error.code]
        }
      });
    }
  }
};
