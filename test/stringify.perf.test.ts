import { describe, expect, it } from '@jest/globals';
import { JsonKit } from '../src';

describe('[stringify] performance', () => {
  it('stringify with ~650KB json data', async () => {
    const data = await import('./dataset/ne_110m_populated_places.json');

    const original = JSON.stringify(data);

    const basic = JsonKit.stringify(data);

    const minified = JsonKit.stringify(data, { minify: { key: true } });

    expect(basic).toEqual(original);

    console.info(
      `${original.length} -> ${minified.length} = ${(
        ((minified.length - original.length) / original.length) *
        100
      ).toFixed(2)}%`
    );
    expect(minified.length).toBeLessThan(original.length);
  });

  it('stringify with ~50MB json data', async () => {
    const data = await import('./dataset/ne_10m_roads.json');

    const original = JSON.stringify(data);

    const basic = JsonKit.stringify(data);

    const minified = JsonKit.stringify(data, { minify: { key: true } });

    expect(basic).toEqual(original);

    console.info(
      `${original.length} -> ${minified.length} = ${(
        ((minified.length - original.length) / original.length) *
        100
      ).toFixed(2)}%`
    );
    expect(minified.length).toBeLessThan(original.length);
  });
});
