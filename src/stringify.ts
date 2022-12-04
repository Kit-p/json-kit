import { EJSON } from 'bson';
import cloneDeep from 'lodash.clonedeep';
import {
  MINIFY_REMAINING_CANDIDATES,
  MINIFY_STARTING_CANDIDATES,
} from './constants';

export type StringifyReplacer = (this: any, key: string, value: any) => any;

export interface StringifyOptions {
  extended?: boolean | { enable: boolean; relaxed?: boolean };
  minify?: false | { whitespace?: boolean; key?: boolean };
}

interface _StringifyOptions {
  extended: { enable: boolean; relaxed: boolean };
  minify: { whitespace: boolean; key: boolean };
}

const defaultOptions: _StringifyOptions = {
  extended: { enable: false, relaxed: true },
  minify: { whitespace: false, key: false },
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

  return input as _StringifyOptions;
}

export function stringify(
  obj: any,
  replacer?: StringifyReplacer | StringifyOptions | null,
  space?: string | number,
  options?: StringifyOptions
): string {
  let _replacer: StringifyReplacer | undefined = undefined;
  if (replacer != null && typeof replacer === 'function') {
    _replacer = replacer satisfies StringifyReplacer;
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

  if (_options.extended.enable) {
    return EJSON.stringify(obj, _replacer, space, {
      relaxed: _options.extended.relaxed,
    });
  }
  return JSON.stringify(obj, _replacer, space);
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
