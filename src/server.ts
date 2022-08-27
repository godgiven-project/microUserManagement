import { App } from '@godgiven/type-server';
import { authFunction } from './middleware/authentication-user.js';
import {
  pageHome,
  pageRegister,
  pageGetVerifyCode,
  pageVerifyUser,
  pageGetUserData,
  pageVerifyToken
} from './page/index.js';

const app = new App();
app.port = 5000;
app.version = 'v1';
app.middlewareList.push(authFunction);

app.register('GET', '/', pageHome);
app.register('GET', '', pageHome);
app.register('POST', '/GetVerifyCode', pageGetVerifyCode);
app.register('POST', '/VerifyUser', pageVerifyUser);
app.register('POST', '/Register', pageRegister);
app.register('POST', '/GetUserData', pageGetUserData);
app.register('POST', '/VerifyToken', pageVerifyToken);

app.listen();
