import * as Stringify from './stringify';
import * as Parse from './parse';

export const JsonKit = {
  ...Stringify,
  ...Parse,
} as const;
