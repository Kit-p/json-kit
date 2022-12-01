import { deserialize, EJSON, serialize } from 'bson';
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
  obj = deserialize(serialize(obj as any, { ignoreUndefined: true })) as T;

  const keyMap: Record<string, string> = {};
  const reverseKeyMap: Record<string, string> = {};
  const objMaps: Array<{ obj: any; key: string; value: any }> = [];
  const allKeys: string[] = [];
  const queue: any[] = [obj];
  while (queue.length > 0) {
    const current = queue.shift();

    if (current == null) {
      continue;
    }

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (current.constructor === Object) {
      for (const [key, value] of Object.entries(current)) {
        objMaps.push({ obj: current, key, value });
        allKeys.push(key);
        queue.push(value);
      }
    }

    // ignore primitives, functions, and custom objects (e.g. Date)
  }

  const startChoices = MINIFY_STARTING_CANDIDATES.length;
  const remainChoices = MINIFY_REMAINING_CANDIDATES.length;
  let idx = 0;
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];

    if (reverseKeyMap[key] != null) {
      continue;
    }

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
    } while (allKeys.includes(minifiedKey));

    keyMap[minifiedKey] = key;
    reverseKeyMap[key] = minifiedKey;
  }

  for (const { obj, key, value } of objMaps) {
    obj[reverseKeyMap[key]] = value;
    delete obj[key];
  }

  return {
    _jkv: obj,
    _jkm: keyMap,
  };
}
