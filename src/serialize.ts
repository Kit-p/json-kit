import { parse } from './parse.js';
import { stringify } from './stringify.js';
import type { TypeGuardFunction } from './types.js';

/**
 * Turns the input object into an EJSON object.
 *
 * @remarks
 * It is equivalent to (except a bit more performant due to custom options)
 * ```ts
 * let obj = { ... }
 * parse(stringify(obj, { extended: true }))
 * ```
 *
 * @param obj - The input object
 * @param typeGuard - The type guard function, ensures that the output object is of the expected type, refer to {@link TypeGuardFunction} for an example.
 * @typeParam T - Type of the output object
 * @returns The EJSON object
 */
export function serialize<const T>(
  obj: any,
  typeGuard?: TypeGuardFunction<T>,
): T {
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

/**
 * Turns the input object into an JSON object.
 *
 * @remarks
 * It is equivalent to (except a bit more performant due to custom options)
 * ```ts
 * let obj = { ... }
 * parse(stringify(obj), { extended: true })
 * ```
 *
 * @param obj - The input object
 * @param typeGuard - The type guard function, ensures that the output object is of the expected type, refer to {@link Types.TypeGuardFunction} for an example.
 * @typeParam T - Type of the output object
 * @returns The JSON object
 */
export function deserialize<const T>(
  obj: any,
  typeGuard?: TypeGuardFunction<T>,
): T {
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
