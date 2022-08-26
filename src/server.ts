import { App } from '@godgiven/type-server';
import { authFunction } from './middleware/authentication-user.js';
import {
  pageHome,
  pageRegister,
  pageVerificationToken,
  pageVerify
} from './page/index.js';

const app = new App();
app.port = 5000;
app.version = 'v1';
app.middlewareList.push(authFunction);

app.register('GET', '/', pageHome);
app.register('GET', '', pageHome);
app.register('POST', '/VerificationToken', pageVerificationToken);
app.register('POST', '/VerifyToken', pageVerify);
app.register('POST', '/register', pageRegister);

app.listen();
