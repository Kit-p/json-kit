import { EJSON } from 'bson';
import cloneDeep from 'lodash.clonedeep';
import { compress } from 'lz4js';
import {
  MINIFY_REMAINING_CANDIDATES,
  MINIFY_STARTING_CANDIDATES,
} from './constants';

export type StringifyReplacerArray = (string | number)[];
export type StringifyReplacerFunction = (
  this: any,
  key: string,
  value: any
) => any;

export interface StringifyOptions {
  extended?: boolean | { enable: boolean; relaxed?: boolean };
  minify?: boolean | { enable: boolean; keyMap?: Record<string, string> };
  compress?: boolean | { enable: boolean };
}

interface _StringifyOptions {
  extended: { enable: boolean; relaxed: boolean };
  minify: { enable: boolean; keyMap: Record<string, string> | undefined };
  compress: { enable: boolean };
}

const defaultOptions: _StringifyOptions = {
  extended: { enable: false, relaxed: true },
  minify: { enable: false, keyMap: undefined },
  compress: { enable: false },
};

function mergeWithDefaultOptions(input?: StringifyOptions): _StringifyOptions {
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

export function stringify(
  obj: any,
  replacer?:
    | StringifyReplacerArray
    | StringifyReplacerFunction
    | StringifyOptions
    | null,
  space?: string | number,
  options?: StringifyOptions
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
    result = EJSON.stringify(obj, _replacer, space, {
      relaxed: _options.extended.relaxed,
    });
  } else {
    result = JSON.stringify(obj, _replacer, space);
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

function getMinifyKeyMap<T>(obj: T): Record<string, string> {
  const keyMap: Record<string, string> = {};
  const keyCounts: Record<string, number> = findAllJsonKeys(obj);

  const allKeys = Object.keys(keyCounts);
  const startChoices = MINIFY_STARTING_CANDIDATES.length;
  const remainChoices = MINIFY_REMAINING_CANDIDATES.length;
  let idx = 0;
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];

    let minifiedKey: string;
    do {
      if (idx < startChoices - 1) {
        minifiedKey = MINIFY_STARTING_CANDIDATES[idx];
      } else {
        const _idx = idx - startChoices + 1;
        const startIdx = Math.floor(_idx / remainChoices);
        const remainIdx = _idx % remainChoices;
        minifiedKey = `${MINIFY_STARTING_CANDIDATES[startIdx]}${MINIFY_REMAINING_CANDIDATES[remainIdx]}`;
      }
      ++idx;
    } while (keyCounts[minifiedKey] != null);

    if (key.length * (keyCounts[key] - 1) < minifiedKey.length * 2) {
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
  keyCounts: Record<string, number> = {}
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
  level?: number
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

export function compressString(str: string): string {
  return Buffer.from(compress(new TextEncoder().encode(str))).toString(
    'base64url'
  );
}
