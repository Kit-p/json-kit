import { EJSON } from 'bson';
import { base64ToBytes } from 'byte-base64';
import { decompress } from 'lz4js';

export type ParseTypeGuardFunction<T> = (obj: any) => obj is T;
export type ParseReviverFunction = (this: any, key: string, value: any) => any;

export interface ParseOptions {
  extended?: boolean | { enable: boolean; relaxed?: boolean };
  unminify?: boolean | { enable: boolean; keyMap?: Record<string, string> };
  decompress?: boolean | { enable: boolean };
}

interface _ParseOptions {
  extended: { enable: boolean; relaxed: boolean };
  unminify: { enable: boolean; keyMap?: Record<string, string> };
  decompress: { enable: boolean };
}

const defaultOptions: _ParseOptions = {
  extended: { enable: false, relaxed: true },
  unminify: { enable: true, keyMap: undefined },
  decompress: { enable: true },
};

function mergeWithDefaultOptions(input?: ParseOptions): _ParseOptions {
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

export function parse<T = any>(
  text: string,
  reviver?: ParseReviverFunction | ParseOptions | null,
  options?: ParseOptions,
  typeGuard?: ParseTypeGuardFunction<T>
): T {
  let _reviver: ParseReviverFunction | undefined = undefined;
  if (typeof reviver === 'function') {
    _reviver = reviver satisfies ParseReviverFunction;
  } else if (options == null) {
    options = (reviver ?? undefined) satisfies ParseOptions | undefined;
    reviver = undefined;
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
    if (typeGuard?.(result) === false) {
      throw new Error(
        'Please throw a custom error in the type guard function to track the problems'
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
  level?: number
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

export function decompressString(str: string): string {
  try {
    return new TextDecoder().decode(
      Uint8Array.from(decompress(base64ToBytes(str)))
    );
  } catch (err: unknown) {
    // str is not a base64 encoded string of a byte array
    return str;
  }
}