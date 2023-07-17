import { parse } from './parse.js';
import { stringify } from './stringify.js';
import type { TypeGuardFunction } from './types.js';

export function serialize<const T>(obj: any, typeGuard?: TypeGuardFunction<T>) {
  return parse(
    stringify(obj, {
      extended: { enable: true, relaxed: true },
      compress: { enable: false },
      minify: { enable: false },
    }),
    null,
    {
      extended: { enable: false },
      decompress: { enable: false },
      unminify: { enable: false },
    },
    typeGuard,
  );
}

export function deserialize<const T>(
  obj: any,
  typeGuard?: TypeGuardFunction<T>,
) {
  return parse(
    stringify(obj, {
      extended: { enable: false },
      compress: { enable: false },
      minify: { enable: false },
    }),
    null,
    {
      extended: { enable: true, relaxed: true },
      decompress: { enable: false },
      unminify: { enable: false },
    },
    typeGuard,
  );
}
