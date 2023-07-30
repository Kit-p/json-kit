import { describe, expect, it } from '@jest/globals';
import { EJSON } from 'bson';
import { JsonKit } from '../src/index.js';
import type { ParseReviverFunction } from '../src/parse.js';

describe('[parse] basic', () => {
  const text =
    '{"2":"2","a":1,"":true," ":null,"arr":[1,"2",true,null,[],{}],"nested":{"2":"2","a":1},"empty":{}}';

  it('parse should have identical behavior as built-in JSON.parse', () => {
    const reviver: ParseReviverFunction = () => 'test';

    expect(JsonKit.parse(text)).toStrictEqual(JSON.parse(text));

    expect(JsonKit.parse(text, reviver)).toStrictEqual(
      JSON.parse(text, reviver),
    );
  });

  it('parse should have identical behavior as bson.EJSON.parse', () => {
    const reviver: ParseReviverFunction = () => 'test';

    expect(
      JsonKit.parse(text, { extended: { enable: true, relaxed: false } }),
    ).toStrictEqual(EJSON.parse(text, { relaxed: false }));

    expect(
      JsonKit.parse(text, { extended: { enable: true, relaxed: true } }),
    ).toStrictEqual(EJSON.parse(text, { relaxed: true }));

    expect(JsonKit.parse(text, reviver, { extended: true })).toStrictEqual(
      EJSON.parse(text),
    );
  });

  it('parse default options should match docs', () => {
    const base = JsonKit.parse(text);
    const emptyOptions = JsonKit.parse(text, {});
    const optionsShorthand = JsonKit.parse(text, {
      extended: true,
      unminify: false,
      decompress: false,
    });
    const optionsFull = JsonKit.parse(text, {
      extended: { enable: false },
      unminify: { enable: true },
      decompress: { enable: true },
    });
    const optionsDefaultFull = JsonKit.parse(text, {
      extended: { enable: true, relaxed: true },
      unminify: { enable: false, keyMap: undefined },
      decompress: { enable: false },
    });
    const defaultOptions = JsonKit.parse(text, {
      extended: { enable: false, relaxed: true },
      unminify: { enable: true, keyMap: undefined },
      decompress: { enable: true },
    });

    expect(base).toStrictEqual(defaultOptions);

    expect(emptyOptions).toStrictEqual(defaultOptions);

    expect(optionsShorthand).toStrictEqual(optionsDefaultFull);

    expect(optionsFull).toStrictEqual(defaultOptions);
  });
});

describe('[parse] unminify', () => {
  const obj = {
    'very-long-name': {
      'very-long-name': 'very-long-name',
      'very-long-name-2': 2,
    },
    arr: [
      { 'very-long-name': { 'very-long-name': 'very-long-name' } },
      { 'very-long-name-2': true },
    ],
    normal: 'string',
  };

  it('parse unminify without keyMap', () => {
    const text =
      '{"_jkv":{"normal":"string","a0":{"a0":"very-long-name","a1":2},"arr":[{"a0":{"a0":"very-long-name"}},{"a1":true}]},"_jkm":{"a0":"very-long-name","a1":"very-long-name-2"}}';
    expect(
      JsonKit.parse(text, (key, value) => (key !== 'arr' ? value : undefined), {
        unminify: { enable: true, keyMap: undefined },
      }),
    ).toStrictEqual({
      'very-long-name': obj['very-long-name'],
      normal: obj['normal'],
    });
  });

  it('parse unminify with keyMap', () => {
    const text =
      '{"_jkv":{"arr":[{"vln":{"vln":"very-long-name"}},{"vln2":true}],"normal":"string","vln":{"vln":"very-long-name","vln2":2}},"_jkm":{"vln":"very-long-name","vln2":"very-long-name-2"}}';
    expect(
      JsonKit.parse(text, {
        unminify: {
          enable: true,
          keyMap: { vln: 'very-long-name', vln2: 'very-long-name-2' },
        },
      }),
    ).toStrictEqual(obj);
  });
});

describe('[parse] decompress', () => {
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

  it('parse with decompression should have identical behavior as decompression and built-in JSON.stringify', () => {
    const text = JsonKit.stringify(obj, { compress: true });

    const reviver: ParseReviverFunction = () => 'test';

    expect(JsonKit.parse(text, { decompress: true })).toStrictEqual(
      JSON.parse(JsonKit.decompressString(text)),
    );

    expect(JsonKit.parse(text, reviver, { decompress: true })).toStrictEqual(
      JSON.parse(JsonKit.decompressString(text), reviver),
    );
  });

  it('parse with decompression should have identical behavior as decompression and bson.EJSON.stringify', () => {
    const text = JsonKit.stringify(obj, {
      extended: { enable: true, relaxed: false },
      compress: true,
    });
    const textRelaxed = JsonKit.stringify(obj, {
      extended: { enable: true, relaxed: true },
      compress: true,
    });

    const reviver: ParseReviverFunction = () => 'test';

    expect(
      JsonKit.parse(text, {
        extended: { enable: true, relaxed: false },
        decompress: { enable: true },
      }),
    ).toStrictEqual(
      EJSON.parse(JsonKit.decompressString(text), { relaxed: false }),
    );

    expect(
      JsonKit.parse(textRelaxed, {
        extended: { enable: true, relaxed: true },
        decompress: { enable: true },
      }),
    ).toStrictEqual(
      EJSON.parse(JsonKit.decompressString(textRelaxed), { relaxed: true }),
    );

    expect(
      JsonKit.parse(textRelaxed, reviver, { extended: true, decompress: true }),
    ).toStrictEqual(EJSON.parse(JsonKit.decompressString(textRelaxed)));
  });
});

describe('[parse] type guard', () => {
  type TestObject = {
    a: number;
    b: string;
  };

  const typeGuard = (obj: any): obj is TestObject => {
    const _obj: Partial<TestObject> | null | undefined = obj;
    return typeof _obj?.a === 'number' && typeof _obj?.b === 'string';
  };

  it('parse with type guard passing', () => {
    const text = '{"a":1,"b":"2"}';
    expect(() =>
      JsonKit.parse<TestObject>(
        text,
        { extended: false, unminify: false, decompress: false },
        typeGuard,
      ),
    ).not.toThrow();
  });

  it('parse with type guard throwing', () => {
    const text = '{"a":"1","b":"2"}';
    expect(() =>
      JsonKit.parse<TestObject>(
        text,
        { extended: false, unminify: false, decompress: false },
        typeGuard,
      ),
    ).toThrow();
  });
});
