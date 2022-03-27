type Validation = 'required' | 'html';

export interface Config
{
  baseKey: string;
  secretKey: string;
  verifyBaseKey: boolean;
  verifyTokenLength: number;
  databasePath: string;
  validate: Record<string, Record<string, Validation[]>>;
}

export const config: Config =
{
  baseKey: 'phone',
  secretKey: 'test secretKey',
  verifyBaseKey: false,
  verifyTokenLength: 6,
  databasePath: './data',
  validate: {
    base: {},
    register: {
      username: ['required'],
      password: ['required']
    },
    login: {
      username: ['required'],
      password: ['required']
    }
  }
};
