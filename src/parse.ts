import { EJSON } from 'bson';
import { Base64 } from 'js-base64';
import { decompress } from 'lz4js';
import type { TypeGuardFunction } from './types.js';

/**
 * Type for the `reviver` parameter of {@link parse}.
 * Refer to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter | the MDN documentation} for more details.
 *
 * @public
 */
export type ParseReviverFunction = (this: any, key: string, value: any) => any;

/**
 * Type for the `options` parameter of {@link parse}.
 *
 * @privateRemarks
 * Refer to {@link defaultOptions} for the default values.
 *
 * @public
 */
export type ParseOptions = {
  /**
   * Specifies if the input string is in JSON or EJSON format, additional options to be passed into {@link https://github.com/mongodb/js-bson#ejsonparsetext-options | `bson.EJSON.parse()`} can be supplied with the long form (only effective if `enable` is `true`.
   * @defaultValue `false`
   */
  extended?:
    | boolean
    | {
        /**
         * `true` to specify the input is an EJSON string.
         */
        enable: boolean;
        /**
         * Refer to {@link https://github.com/mongodb/js-bson#ejsonparsetext-options | `bson.EJSON.parse()`}.
         *
         * @defaultValue `true`
         */
        relaxed?: boolean;
      };
  /**
   * Specifies if the input string is created with the `minify` option enabled in {@link Stringify.stringify}, a custom key map (shortened:original) can be supplied with the long form (only effective if `enable` is `true`.
   *
   * @remarks
   * Will automatically disable if the unminifcation fails.
   *
   * @defaultValue `true`
   */
  unminify?:
    | boolean
    | {
        /**
         * `true` to specify the input is created with the `minify` option enabled in {@link Stringify.stringify}, will automatically disable if the unminification fails.
         */
        enable: boolean;
        /**
         * custom key map of form (shortened:original), if supplied then only the specified keys will be replaced.
         *
         * @defaultValue `undefined`
         */
        keyMap?: Record<string, string>;
      };
  /**
   * Specifies if the input string is compressed with {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}.
   *
   * @remarks
   * Will automatically disable if the decompression fails.
   *
   * @defaultValue `true`
   */
  decompress?:
    | boolean
    | {
        /**
         * `true` to specify the input is compressed with {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}, will automatically disable if the decompression fails.
         */
        enable: boolean;
      };
};

type _ParseOptions = {
  extended: { enable: boolean; relaxed: boolean };
  unminify: { enable: boolean; keyMap?: Record<string, string> };
  decompress: { enable: boolean };
};

const defaultOptions: _ParseOptions = {
  extended: { enable: false, relaxed: true },
  unminify: { enable: true, keyMap: undefined },
  decompress: { enable: true },
};

function mergeWithDefaultOptions(input?: ParseOptions | null): _ParseOptions {
  if (input == null) return defaultOptions;

  if (input.extended == null) {
    input.extended = defaultOptions.extended;
  } else if (typeof input.extended === 'boolean') {
    input.extended = {
      enable: input.extended,
      relaxed: defaultOptions.extended.relaxed,
    };
  } else {
    input.extended = {
      enable: input.extended.enable,
      relaxed: input.extended.relaxed ?? defaultOptions.extended.relaxed,
    };
  }

  if (input.unminify == null) {
    input.unminify = defaultOptions.unminify;
  } else if (typeof input.unminify === 'boolean') {
    input.unminify = {
      enable: input.unminify,
      keyMap: defaultOptions.unminify.keyMap,
    };
  } else {
    input.unminify = {
      enable: input.unminify.enable,
      keyMap: input.unminify.keyMap ?? defaultOptions.unminify.keyMap,
    };
  }

  if (input.decompress == null) {
    input.decompress = defaultOptions.decompress;
  } else if (typeof input.decompress === 'boolean') {
    input.decompress = {
      enable: input.decompress,
    };
  } else {
    input.decompress = {
      enable: input.decompress.enable,
    };
  }

  return input as _ParseOptions;
}

/**
 * Turns the input string into an object.
 *
 * @remarks
 * With the custom options, the input string can be either
 *  - a JSON string (identical to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse | `JSON.parse()`})
 *  - an EJSON string (identical to {@link https://github.com/mongodb/js-bson#ejsonparsetext-options | `bson.EJSON.parse()`})
 *  - a minified version of either of the above, where some or specified keys are replaced with a shorter identifier
 *  - a compressed version (by {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}) of either of the above
 *
 * @param text - The input string
 * @param reviver - The `reviver` parameter of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter | `JSON.parse()`}
 * @param options - The custom options, refer to {@link ParseOptions} for details
 * @param typeGuard - The type guard function, ensures that the output object is of the expected type, refer to {@link Types.TypeGuardFunction} for an example.
 * @typeParam T - Type of the output object
 * @returns The output object
 *
 * @example
 * ```ts
 * type Foo {
 *   long_key: string
 * }
 *
 * parse<Foo>(
 *   "{\"lk\":\"A Large Object\"}",
 *   (key, val) => {
 *     if (key === "lk") {
 *       return "A Modified Large Object"
 *     }
 *     return val
 *   },
 *   {
 *     extended: false,
 *     unminify: { enable: true, keyMap: { "lk": "long_key" } },
 *     decompress: false
 *   },
 *   (obj: any): obj is Foo => {
 *     const _obj: Partial<Foo> | null | undefined = obj
 *     return typeof _obj?.long_key === "string"
 *   }
 * )
 * ```
 *
 * @public
 * {@label FULL}
 */
export function parse<const T>(
  text: string,
  reviver?: ParseReviverFunction | null,
  options?: ParseOptions | null,
  typeGuard?: TypeGuardFunction<T>,
): T;
/**
 * Turns the input string into an object.
 *
 * @remarks
 * With the custom options, the input string can be either
 *  - a JSON string (identical to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse | `JSON.parse()`})
 *  - an EJSON string (identical to {@link https://github.com/mongodb/js-bson#ejsonparsetext-options | `bson.EJSON.parse()`})
 *  - a minified version of either of the above, where some or specified keys are replaced with a shorter identifier
 *  - a compressed version (by {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}) of either of the above
 *
 * @param text - The input string
 * @param options - The custom options, refer to {@link ParseOptions} for details
 * @param typeGuard - The type guard function, ensures that the output object is of the expected type, refer to {@link Types.TypeGuardFunction} for an example.
 * @typeParam T - Type of the output object
 * @returns The output object
 *
 * @example
 * ```ts
 * type Foo {
 *   long_key: string
 * }
 *
 * parse<Foo>(
 *   "{\"lk\":\"A Large Object\"}",
 *   {
 *     extended: false,
 *     unminify: { enable: true, keyMap: { "lk": "long_key" } },
 *     decompress: false
 *   },
 *   (obj: any): obj is Foo => {
 *     const _obj: Partial<Foo> | null | undefined = obj
 *     return typeof _obj?.long_key === "string"
 *   }
 * )
 * ```
 *
 * @public
 * {@label MINIMAL}
 */
export function parse<const T>(
  text: string,
  options?: ParseOptions | null,
  typeGuard?: TypeGuardFunction<T>,
): T;
/**
 * Implementation details.
 *
 * @remarks
 * If you see this, your are NOT calling this function with a valid signature.
 *
 * {@label IMPLEMENTATION}
 */
export function parse<const T>(
  text: string,
  reviver?: ParseReviverFunction | ParseOptions | null,
  options?: ParseOptions | TypeGuardFunction<T> | null,
  typeGuard?: TypeGuardFunction<T>,
): T {
  let _reviver: ParseReviverFunction | undefined;
  if (typeof reviver === 'function') {
    _reviver = reviver satisfies ParseReviverFunction;
  } else if (options == null) {
    options = (reviver ?? undefined) satisfies ParseOptions | undefined;
    reviver = undefined;
  }

  let _typeGuard: TypeGuardFunction<T> | undefined;
  if (typeof options === 'function') {
    _typeGuard = options satisfies TypeGuardFunction<T>;
    options = undefined;
  } else {
    _typeGuard = typeGuard;
  }

  const _options = mergeWithDefaultOptions(options);

  if (_options.decompress.enable) {
    text = decompressString(text);
  }

  let result: any;
  if (_options.extended.enable) {
    /**
     * EJSON.parse does not accept reviver function in bson@4.7.2
     * tracking issue at https://jira.mongodb.org/browse/NODE-4497
     */
    result = EJSON.parse(text, {
      relaxed: _options.extended.relaxed,
    });
  } else {
    result = JSON.parse(text, _reviver);
  }

  if (_options.unminify.enable) {
    result = unminifyKeys(result, _options.unminify.keyMap);
  }

  try {
    if (_typeGuard?.(result) === false) {
      throw new Error(
        'Please throw a custom error in the type guard function to track the problems',
      );
    }
  } catch (err: unknown) {
    let errMsg = 'Parsed object faild to pass type guard';
    if (err instanceof Error && err.message?.length > 0) {
      errMsg += `\n           Reason: ${err.message}`;
    }
    throw new TypeError(errMsg);
  }
  return result;
}

function unminifyKeys(
  obj: any,
  keyMap?: Record<string, string>,
  level?: number,
): any {
  let _level: number;
  if (level == null || level === 0) {
    if (keyMap == null) {
      if (obj?._jkv == null || obj?._jkm == null) {
        return obj;
      }
      keyMap = obj._jkm;
    }
    if (obj?._jkv != null) {
      delete obj._jkm;
      obj = obj._jkv;
    }
    _level = 1;
  } else {
    _level = level + 1;
  }

  if (Array.isArray(obj)) {
    obj.forEach((o, i) => {
      obj[i] = unminifyKeys(o, keyMap, _level);
    });
  } else if (obj?.constructor === Object) {
    Object.entries(obj).forEach(([key, value]) => {
      value = unminifyKeys(value, keyMap, _level);
      const originalKey = keyMap?.[key];
      if (typeof originalKey === 'string' && originalKey.length > 0) {
        obj[originalKey] = value;
        delete obj[key];
      }
    });
  }

  return obj;
}

/**
 * Decompresses a string with {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L538 | `lz4js.decompress()`}.
 *
 * @param str - The input string
 * @returns str - The decompressed string
 *
 * @public
 */
export function decompressString(str: string): string {
  try {
    return new TextDecoder().decode(
      Uint8Array.from(decompress(Base64.toUint8Array(str))),
    );
  } catch (err: unknown) {
    // str is not a base64 encoded string of a byte array
    return str;
  }
}
