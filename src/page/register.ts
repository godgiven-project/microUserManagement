import { ServerResponse } from 'http';
import { requestType } from '../middleware/authentication-user';
import { sendResponse } from '@godgiven/type-server';

export const pageRegister = async (_request: requestType, response: ServerResponse): Promise<void> =>
{
  sendResponse(response, 200, {
    ok: true,
    description: '..:: Welcome ::..',
    // data: {
    //   app: packageJson.description,
    // },
  });
};
