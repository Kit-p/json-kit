import { EJSON } from 'bson';
import { JsonKit } from '../src';

describe('stringify', () => {
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
    expect(JsonKit.stringify(obj)).toEqual(JSON.stringify(obj));
  });

  it('stringify should have identical behavior as bson.EJSON.stringify', () => {
    expect(
      JsonKit.stringify(obj, { extended: { enable: true, relaxed: false } })
    ).toEqual(EJSON.stringify(obj, { relaxed: false }));

    expect(
      JsonKit.stringify(obj, { extended: { enable: true, relaxed: true } })
    ).toEqual(EJSON.stringify(obj, { relaxed: true }));
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
