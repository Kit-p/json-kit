import { EJSON } from 'bson';

export interface StringifyOptions {
  extended?: boolean | { enable: boolean; relaxed?: boolean };
}

interface _StringifyOptions {
  extended: { enable: boolean; relaxed: boolean };
}

const defaultOptions = {
  extended: { enable: false, relaxed: true },
} as const satisfies StringifyOptions;

function mergeWithDefaultOptions(
  input: StringifyOptions | undefined
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

  return input as _StringifyOptions;
}

export function stringify(obj: any, options?: StringifyOptions): string {
  const _options = mergeWithDefaultOptions(options);

  if (_options.extended.enable) {
    return EJSON.stringify(obj, { relaxed: _options.extended.relaxed });
  }
  return JSON.stringify(obj);
}
