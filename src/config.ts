type Validation = 'required' | 'html';

export interface Config
{
  baseKey: string;
  secreatKey: string;
  shouldVerify: boolean;
  verifyCodeLenthe: number;
  databasePath: string;
  validate: Record<string, Record<string, Validation[]>>;
}

export const config: Config =
{
  baseKey: 'phone',
  secreatKey: 'test secretKey',
  shouldVerify: false,
  verifyCodeLenthe: 6,
  databasePath: './data',
  validate: {
    base: {},
    rigister: {
      username: ['required'],
      password: ['required']
    },
    login: {
      username: ['required'],
      password: ['required']
    }
  }
};
