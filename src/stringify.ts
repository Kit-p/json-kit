import { EJSON } from 'bson';

export type StringifyReplacer = (this: any, key: string, value: any) => any;

export interface StringifyOptions {
  extended?: boolean | { enable: boolean; relaxed?: boolean };
}

interface _StringifyOptions {
  extended: { enable: boolean; relaxed: boolean };
}

const defaultOptions: _StringifyOptions = {
  extended: { enable: false, relaxed: true },
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

  return input as _StringifyOptions;
}

export function stringify(
  obj: any,
  replacer?: StringifyReplacer | StringifyOptions,
  space?: string | number,
  options?: StringifyOptions
): string {
  let _replacer: StringifyReplacer | undefined = undefined;
  if (replacer != null && typeof replacer === 'function') {
    _replacer = replacer satisfies StringifyReplacer;
  } else {
    options = replacer satisfies StringifyOptions | undefined;
    replacer = undefined;
  }

  const _options = mergeWithDefaultOptions(options);

  if (_options.extended.enable) {
    return EJSON.stringify(obj, _replacer, space, {
      relaxed: _options.extended.relaxed,
    });
  }
  return JSON.stringify(obj, _replacer, space);
}
