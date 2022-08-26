import type { validate } from '@godgiven/validator';

type validateKey = keyof typeof validate;

export interface Config
{
  baseKey: string;
  verifyBaseKey: boolean;
  verifyTokenLength: number;
  databasePath: string;
  validate: Record<string, Record<string, validateKey[]>>;
}

export const config: Config =
{
  baseKey: 'phone',
  verifyBaseKey: true,
  verifyTokenLength: 6,
  databasePath: './data',
  validate: {
    base: {},
    register: {
      name: ['isExist'],
    },
  }
};
