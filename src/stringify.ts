import { EJSON } from 'bson';
import cloneDeep from 'lodash.clonedeep';
import { compress } from 'lz4-wasm-nodejs';
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
  minify?: false | { whitespace?: boolean; key?: boolean };
  compress?: boolean | { enable: boolean };
}

interface _StringifyOptions {
  extended: { enable: boolean; relaxed: boolean };
  minify: { whitespace: boolean; key: boolean };
  compress: { enable: boolean };
}

const defaultOptions: _StringifyOptions = {
  extended: { enable: false, relaxed: true },
  minify: { whitespace: false, key: false },
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
      whitespace: input.minify,
      key: defaultOptions.minify.key,
    };
  } else {
    input.minify = {
      whitespace: input.minify.whitespace ?? defaultOptions.minify.whitespace,
      key: input.minify.key ?? defaultOptions.minify.key,
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
    _replacer = replacer satisfies StringifyReplacerArray;
  } else if (typeof replacer === 'function') {
    _replacer = replacer satisfies StringifyReplacerFunction;
  } else if (options == null) {
    options = (replacer ?? undefined) satisfies StringifyOptions | undefined;
    replacer = undefined;
  }

  const _options = mergeWithDefaultOptions(options);

  if (_options.minify.whitespace) {
    space = undefined;
  }

  if (_options.minify.key) {
    obj = minifyJsonKeys(obj);
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

export interface KeyMinifiedJson<T> {
  _jkv: T;
  _jkm: Record<string, string>;
}

function minifyJsonKeys<T>(obj: T): KeyMinifiedJson<T> {
  obj = cloneDeep(obj);

  const keyMap: Record<string, string> = {};
  const reverseKeyMap: Record<string, string> = {};
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

    keyMap[minifiedKey] = key;
    reverseKeyMap[key] = minifiedKey;
  }

  obj = minifyAllKeys(obj, reverseKeyMap);

  return {
    _jkv: obj,
    _jkm: keyMap,
  };
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

function minifyAllKeys(obj: any, reverseKeyMap: Record<string, string>): any {
  if (Array.isArray(obj)) {
    obj.forEach((o, i) => {
      obj[i] = minifyAllKeys(o, reverseKeyMap);
    });
  } else if (obj?.constructor === Object) {
    Object.entries(obj).forEach(([key, value]) => {
      value = minifyAllKeys(value, reverseKeyMap);
      const minifiedKey = reverseKeyMap[key];
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
