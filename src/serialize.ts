import { parse } from './parse.js';
import { stringify } from './stringify.js';

export function serialize(obj: any) {
  return parse(
    stringify(obj, {
      extended: { enable: true, relaxed: true },
      compress: { enable: false },
      minify: { enable: false },
    }),
    {
      extended: { enable: false },
      decompress: { enable: false },
      unminify: { enable: false },
    },
  );
}

export function deserialize(obj: any) {
  return parse(
    stringify(obj, {
      extended: { enable: false },
      compress: { enable: false },
      minify: { enable: false },
    }),
    {
      extended: { enable: true, relaxed: true },
      decompress: { enable: false },
      unminify: { enable: false },
    },
  );
}
