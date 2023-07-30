import { EJSON } from 'bson';
import { Base64 } from 'js-base64';
import cloneDeep from 'lodash.clonedeep';
import { compress } from 'lz4js';
import {
  MINIFY_REMAINING_CANDIDATES,
  MINIFY_STARTING_CANDIDATES,
} from './constants.js';

/**
 * `Array` type for the `replacer` parameter of {@link stringify}.
 * Refer to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter | the MDN documentation} for more details.
 *
 * @public
 */
export type StringifyReplacerArray = (string | number)[];
/**
 * `Function` type for the `replacer` parameter of {@link stringify}.
 * Refer to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter | the MDN documentation} for more details.
 *
 * @public
 */
export type StringifyReplacerFunction = (
  this: any,
  key: string,
  value: any,
) => any;

/**
 * Type for the `options` parameter of {@link stringify}.
 *
 * @privateRemarks
 * Refer to {@link defaultOptions} for the default values.
 *
 * @public
 */
export type StringifyOptions = {
  /**
   * Determines if the output string is in JSON or EJSON format, additional options to be passed into {@link https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options | `bson.EJSON.stringify()`} can be supplied with the long form (only effective if `enable` is `true`.
   * @defaultValue `false`
   */
  extended?:
    | boolean
    | {
        /**
         * `true` to produce an EJSON string, otherwise to produce a JSON string.
         */
        enable: boolean;
        /**
         * Refer to {@link https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options | `bson.EJSON.stringify()`}.
         *
         * @defaultValue `true`
         */
        relaxed?: boolean;
      };
  /**
   * Determines if the output string will have some of the keys replaced with a shorter identifier, a custom key map (original:shortened) can be supplied with the long form (only effective if `enable` is `true`.
   * @defaultValue `false`
   */
  minify?:
    | boolean
    | {
        /**
         * `true` to replace some keys with a shorter identifier, otherwise output it as is.
         */
        enable: boolean;
        /**
         * custom key map of form (original:shortened), if supplied then only the specified keys will be replaced.
         *
         * @defaultValue `undefined`
         */
        keyMap?: Record<string, string>;
      };
  /**
   * Determines if the output string will be compressed with {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}.
   * @defaultValue `false`
   */
  compress?:
    | boolean
    | {
        /**
         * `true` to output a compressed string (by {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}), otherwise output it as is.
         */
        enable: boolean;
      };
};

type _StringifyOptions = {
  extended: { enable: boolean; relaxed: boolean };
  minify: { enable: boolean; keyMap: Record<string, string> | undefined };
  compress: { enable: boolean };
};

const defaultOptions: _StringifyOptions = {
  extended: { enable: false, relaxed: true },
  minify: { enable: false, keyMap: undefined },
  compress: { enable: false },
};

function mergeWithDefaultOptions(
  input?: StringifyOptions | null,
): _StringifyOptions {
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

  if (input.minify == null) {
    input.minify = defaultOptions.minify;
  } else if (typeof input.minify === 'boolean') {
    input.minify = {
      enable: input.minify,
      keyMap: defaultOptions.minify.keyMap,
    };
  } else {
    input.minify = {
      enable: input.minify.enable,
      keyMap: input.minify.keyMap ?? defaultOptions.minify.keyMap,
    };
  }

  if (input.compress == null) {
    input.compress = defaultOptions.compress;
  } else if (typeof input.compress === 'boolean') {
    input.compress = {
      enable: input.compress,
    };
  } else {
    input.compress = {
      enable: input.compress.enable,
    };
  }

  return input as _StringifyOptions;
}

/**
 * Turns the input object into a string.
 *
 * @remarks
 * With the custom options, the output string can be either
 *  - a JSON string (identical to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify | `JSON.stringify()`})
 *  - an EJSON string (identical to {@link https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options | `bson.EJSON.stringify()`})
 *  - a minified version of either of the above, where some or specified keys will be replaced with a shorter identifier
 *  - a compressed version (by {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}) of either of the above
 *
 * @param obj - The input object
 * @param replacer - The `replacer` parameter of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter | `JSON.stringify()`}
 * @param space - The `space` parameter of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_space_parameter | `JSON.stringify()`}
 * @param options - The custom options, refer to {@link StringifyOptions} for details
 * @returns The output string
 *
 * @example
 * ```ts
 * stringify(
 *   { long_key: "A Large Object" },
 *   (key, val) => {
 *     if (key === "long_key") {
 *       return "A Modified Large Object"
 *     }
 *     return val
 *   },
 *   2,
 *   {
 *     extended: false,
 *     minify: { enable: true, keyMap: { long_key: "lk" } },
 *     compress: false
 *   }
 * )
 * ```
 *
 * @public
 * {@label FULL}
 */
export function stringify(
  obj: any,
  replacer?: StringifyReplacerArray | StringifyReplacerFunction | null,
  space?: string | number | null,
  options?: StringifyOptions | null,
): string;
/**
 * Turns the input object into a string.
 *
 * @remarks
 * With the custom options, the output string can be either
 *  - a JSON string (identical to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify | `JSON.stringify()`})
 *  - an EJSON string (identical to {@link https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options | `bson.EJSON.stringify()`})
 *  - a minified version of either of the above, where some or specified keys will be replaced with a shorter identifier
 *  - a compressed version (by {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}) of either of the above
 *
 * @param obj - The input object
 * @param options - The custom options, refer to {@link StringifyOptions} for details
 * @returns The output string
 *
 * @example
 * ```ts
 * stringify(
 *   { long_key: "A Large Object" },
 *   {
 *     extended: false,
 *     minify: { enable: true, keyMap: { long_key: "lk" } },
 *     compress: false
 *   }
 * )
 * ```
 *
 * @public
 * {@label MINIMAL}
 */
export function stringify(obj: any, options?: StringifyOptions | null): string;
/**
 * Implementation details.
 *
 * @remarks
 * If you see this, your are NOT calling this function with a valid signature.
 *
 * {@label IMPLEMENTATION}
 */
export function stringify(
  obj: any,
  replacer?:
    | StringifyReplacerArray
    | StringifyReplacerFunction
    | StringifyOptions
    | null,
  space?: string | number | null,
  options?: StringifyOptions | null,
): string {
  let _replacer: any = undefined;
  if (Array.isArray(replacer)) {
    replacer = replacer
      .map((key) => key?.toString?.())
      .filter((key) => key != null);
    _replacer = replacer satisfies StringifyReplacerArray;
  } else if (typeof replacer === 'function') {
    _replacer = replacer satisfies StringifyReplacerFunction;
  } else if (options == null) {
    options = (replacer ?? undefined) satisfies StringifyOptions | undefined;
    replacer = undefined;
  }

  const _options = mergeWithDefaultOptions(options);

  if (_options.minify.enable) {
    const keyMap = _options.minify.keyMap ?? getMinifyKeyMap(obj);
    const reversedKeyMap = reverseKeyMap(keyMap);
    obj = minifyKeys(obj, keyMap);
    _replacer = function (key, value) {
      if (key === '') {
        return {
          _jkv: value,
          _jkm: reversedKeyMap,
        };
      }

      if (key === '_jkv' || key === '_jkm') {
        // ignore the internal keys
        return value;
      }

      if (Array.isArray(this)) {
        // only process inner objects, not the array itself
        // "key" here is array index, as string
        return value;
      }

      const originalKey = reversedKeyMap[key] ?? key;
      if (Array.isArray(replacer)) {
        if (!replacer.includes(originalKey)) {
          // only include original keys specified in the replacer array
          return undefined;
        }
      } else if (typeof replacer === 'function') {
        // apply replacer with the original key
        value = replacer.call(this, originalKey, value);
      }

      return value;
    } satisfies StringifyReplacerFunction;
  }

  let result: string;
  if (_options.extended.enable) {
    result = EJSON.stringify(obj, _replacer, space ?? undefined, {
      relaxed: _options.extended.relaxed,
    });
  } else {
    result = JSON.stringify(obj, _replacer, space ?? undefined);
  }

  if (_options.compress.enable) {
    return compressString(result);
  }
  return result;
}

function reverseKeyMap(keyMap: Record<string, string>): Record<string, string> {
  const reversedKeyMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(keyMap)) {
    reversedKeyMap[value] = key;
  }
  return reversedKeyMap;
}

function getMinifyKeyMap(obj: any): Record<string, string> {
  const keyMap: Record<string, string> = {};
  const keyCounts: Readonly<Record<string, number>> = findAllJsonKeys(obj);

  const startChoices = MINIFY_STARTING_CANDIDATES.length;
  const remainChoices = MINIFY_REMAINING_CANDIDATES.length;
  let idx = 0;
  for (const [key, keyCount] of Object.entries(keyCounts)) {
    let minifiedKey: string;
    do {
      if (idx < startChoices - 1) {
        minifiedKey = `${MINIFY_STARTING_CANDIDATES[idx]}`;
      } else {
        const _idx = idx - startChoices + 1;
        const startIdx = Math.floor(_idx / remainChoices);
        const remainIdx = _idx % remainChoices;
        minifiedKey = `${MINIFY_STARTING_CANDIDATES[startIdx]}${MINIFY_REMAINING_CANDIDATES[remainIdx]}`;
      }
      ++idx;
    } while (keyCounts[minifiedKey] != null);

    if (key.length * (keyCount - 1) < minifiedKey.length * 2) {
      // optimization for short keys
      --idx;
      continue;
    }

    keyMap[key] = minifiedKey;
  }

  return keyMap;
}

function findAllJsonKeys(
  obj: any,
  keyCounts: Record<string, number> = {},
): Record<string, number> {
  if (Array.isArray(obj)) {
    obj.forEach((o) => {
      keyCounts = findAllJsonKeys(o, keyCounts);
    });
  } else if (obj?.constructor === Object) {
    Object.entries(obj).forEach(([key, value]) => {
      keyCounts[key] = (keyCounts[key] ?? 0) + 1;
      keyCounts = findAllJsonKeys(value, keyCounts);
    });
  }

  // ignore null, undefined, other primitives, functions, and custom objects (e.g. Date)
  return keyCounts;
}

function minifyKeys(
  obj: any,
  keyMap: Record<string, string>,
  level?: number,
): any {
  let _level: number;
  if (level == null || level === 0) {
    _level = 1;
    obj = cloneDeep(obj);
  } else {
    _level = level + 1;
  }

  if (Array.isArray(obj)) {
    obj.forEach((o, i) => {
      obj[i] = minifyKeys(o, keyMap, _level);
    });
  } else if (obj?.constructor === Object) {
    Object.entries(obj).forEach(([key, value]) => {
      value = minifyKeys(value, keyMap, _level);
      const minifiedKey = keyMap[key];
      if (typeof minifiedKey === 'string' && minifiedKey.length > 0) {
        obj[minifiedKey] = value;
        delete obj[key];
      }
    });
  }

  return obj;
}

/**
 * Compresses a string with {@link https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557 | `lz4js.compress()`}.
 *
 * @param str - The input string
 * @returns str - The compressed string
 *
 * @public
 */
export function compressString(str: string): string {
  return Base64.fromUint8Array(
    compress(new TextEncoder().encode(str)) as Uint8Array,
    true,
  );
}
