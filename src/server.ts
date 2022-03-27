import { App } from '@godgiven/type-server';
import { authFunction } from './middleware/authentication-user.js';
import {
  pageHome,
  pageRigister,
  pageGetVerifyCode
} from './page/index.js';

const app = new App();
app.port = 5000;
app.version = 'v1';
app.middlewareList.push(authFunction);

app.register('GET', '/', pageHome);
app.register('GET', '', pageHome);
app.register('POST', '/getVerifyCode', pageGetVerifyCode);
app.register('GET', '/register', pageRigister);

app.listen();
