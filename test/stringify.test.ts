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
    const optionsShorthand = JsonKit.stringify(obj, {
      extended: true,
      minify: false,
    });
    const optionsFull = JsonKit.stringify(obj, {
      extended: { enable: false },
      minify: { whitespace: false, key: false },
    });
    const optionsDefaultFull = JsonKit.stringify(obj, {
      extended: { enable: true, relaxed: true },
      minify: { whitespace: false, key: false },
    });
    const defaultOptions = JsonKit.stringify(obj, {
      extended: { enable: false, relaxed: true },
      minify: { whitespace: false, key: false },
    });

    expect(base).toEqual(defaultOptions);

    expect(emptyOptions).toEqual(defaultOptions);

    expect(optionsShorthand).toEqual(optionsDefaultFull);

    expect(optionsFull).toEqual(defaultOptions);
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
    date: new Date(1669902255177),
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

  it('stringify minify with key', () => {
    expect(JsonKit.stringify(obj, { minify: { key: true } })).toEqual(
      '{"_jkv":{"a0":{"a0":"very-long-name","a7":2},"a1":1,"a2":true,"a3":null,"a4":"2022-12-01T13:44:15.177Z","a5":[{"a0":{"a0":"very-long-name"}},{"a7":true,"a8":{"a9":"a","aa":"b","ab":"c","ac":"d","ad":"e","ae":"f","af":"g","ag":"h","ah":"i","ai":"j","aj":"k","ak":"l","al":"m","am":"n","an":"o","ao":"p","ap":"q","aq":"r","ar":"s","as":"t","at":"u","au":"v","av":"w","aw":"x","ax":"y","ay":"z","az":1,"b0":2,"b1":3,"b2":4,"b3":5,"b4":6,"b5":7,"b6":8,"b7":9,"b8":10,"b9":11,"ba":12,"bb":13,"bc":14,"bd":15,"be":16,"bf":17,"bg":18,"bh":19,"bi":20,"bj":21,"bk":22,"bl":23,"bm":24,"bn":25,"bo":26}}],"a6":"string"},"_jkm":{"a0":"very-long-name","a1":"number","a2":"boolean","a3":"null","a4":"date","a5":"arr","a6":"normal","a7":"very-long-name-2","a8":"testKeys","a9":"1","aa":"2","ab":"3","ac":"4","ad":"5","ae":"6","af":"7","ag":"8","ah":"9","ai":"10","aj":"11","ak":"12","al":"13","am":"14","an":"15","ao":"16","ap":"17","aq":"18","ar":"19","as":"20","at":"21","au":"22","av":"23","aw":"24","ax":"25","ay":"26","az":"a","b0":"b","b1":"c","b2":"d","b3":"e","b4":"f","b5":"g","b6":"h","b7":"i","b8":"j","b9":"k","ba":"l","bb":"m","bc":"n","bd":"o","be":"p","bf":"q","bg":"r","bh":"s","bi":"t","bj":"u","bk":"v","bl":"w","bm":"x","bn":"y","bo":"z"}}'
    );
  });
});
