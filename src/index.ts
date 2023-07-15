import * as Parse from './parse.js';
import * as Serialize from './serialize.js';
import * as Stringify from './stringify.js';

export const JsonKit = {
  ...Parse,
  ...Serialize,
  ...Stringify,
} as const;
