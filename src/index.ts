import * as Parse from './parse';
import * as Serialize from './serialize';
import * as Stringify from './stringify';

export const JsonKit = {
  ...Parse,
  ...Serialize,
  ...Stringify,
} as const;
