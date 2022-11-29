import { EJSON } from 'bson';
import JsonKit from '../src';
import type { StringifyReplacer } from '../src/stringify';

describe('[stringify] basic', () => {
  const obj = {
    a: 1,
    '2': '2',
    '': true,
    ' ': null,
    'a-b': undefined,
    _c: new Date(),
    toString: () => 'string',
    arr: [1, '2', true, null, undefined, new Date(), () => 'string', [], {}],
    nested: {
      a: 1,
      '2': '2',
    },
    empty: {},
  };

  it('stringify should have identical behavior as built-in JSON.stringify', () => {
    const replacer: StringifyReplacer = () => 'test';

    expect(JsonKit.stringify(obj)).toEqual(JSON.stringify(obj));

    expect(JsonKit.stringify(obj, replacer, ' ')).toEqual(
      JSON.stringify(obj, replacer, ' ')
    );
  });

  it('stringify should have identical behavior as bson.EJSON.stringify', () => {
    const replacer: StringifyReplacer = () => 'test';

    expect(
      JsonKit.stringify(obj, { extended: { enable: true, relaxed: false } })
    ).toEqual(EJSON.stringify(obj, { relaxed: false }));

    expect(
      JsonKit.stringify(obj, { extended: { enable: true, relaxed: true } })
    ).toEqual(EJSON.stringify(obj, { relaxed: true }));

    expect(JsonKit.stringify(obj, replacer, 4, { extended: true })).toEqual(
      EJSON.stringify(obj, replacer, 4)
    );
  });

  it('stringify default options should match docs', () => {
    const base = JsonKit.stringify(obj);
    const emptyOptions = JsonKit.stringify(obj, {});
    const optionsExtended = JsonKit.stringify(obj, { extended: true });
    const optionsExtendedDisable = JsonKit.stringify(obj, {
      extended: { enable: false },
    });
    const optionsExtendedFull = JsonKit.stringify(obj, {
      extended: { enable: true, relaxed: true },
    });
    const defaultOptions = JsonKit.stringify(obj, {
      extended: { enable: false, relaxed: true },
    });

    expect(base).toEqual(defaultOptions);

    expect(emptyOptions).toEqual(defaultOptions);

    expect(optionsExtended).toEqual(optionsExtendedFull);

    expect(optionsExtendedDisable).toEqual(defaultOptions);
  });
});

describe('[stringify] minify', () => {
  const obj = {
    'very-long-name': {
      'very-long-name': 'very-long-name',
      'very-long-name-2': 2,
    },
    number: 1,
    boolean: true,
    null: null,
    undefined: undefined,
    function: () => 'string',
    date: new Date(),
    arr: [
      { 'very-long-name': { 'very-long-name': 'very-long-name' } },
      {
        'very-long-name-2': true,
        testKeys: {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          e: 5,
          f: 6,
          g: 7,
          h: 8,
          i: 9,
          j: 10,
          k: 11,
          l: 12,
          m: 13,
          n: 14,
          o: 15,
          p: 16,
          q: 17,
          r: 18,
          s: 19,
          t: 20,
          u: 21,
          v: 22,
          w: 23,
          x: 24,
          y: 25,
          z: 26,
          1: 'a',
          2: 'b',
          3: 'c',
          4: 'd',
          5: 'e',
          6: 'f',
          7: 'g',
          8: 'h',
          9: 'i',
          10: 'j',
          11: 'k',
          12: 'l',
          13: 'm',
          14: 'n',
          15: 'o',
          16: 'p',
          17: 'q',
          18: 'r',
          19: 's',
          20: 't',
          21: 'u',
          22: 'v',
          23: 'w',
          24: 'x',
          25: 'y',
          26: 'z',
        },
      },
    ],
    normal: 'string',
  };

  it('stringify minify with whitespace only', () => {
    expect(
      JsonKit.stringify(obj, null, 2, { minify: { whitespace: true } })
    ).toEqual(JSON.stringify(obj));

    expect(
      JsonKit.stringify(obj, null, 2, { minify: { whitespace: false } })
    ).toEqual(JSON.stringify(obj, null, 2));
  });

  it('stringify minify with whitespace and key', () => {
    expect(
      JsonKit.stringify(obj, { minify: { whitespace: true, key: true } })
    ).toEqual('');
  });
});
