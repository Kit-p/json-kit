/* eslint-disable @typescript-eslint/no-var-requires */
import { describe, it } from '@jest/globals';
import { JsonKit } from '../src/index.js';
import { formatDuration, timer } from './util/index.js';

const test = (data: any): void => {
  const [original, originalDuration] = timer(() => JSON.stringify(data));

  const [basic, basicDuration] = timer(() => JsonKit.stringify(data));

  const [minified, minifiedDuration] = timer(() =>
    JsonKit.stringify(data, { minify: true })
  );

  const [compressed, compressedDuration] = timer(() =>
    JsonKit.stringify(data, { compress: true })
  );

  const [minifiedAndCompressed, minifiedAndCompressedDuration] = timer(() =>
    JsonKit.stringify(data, {
      minify: true,
      compress: true,
    })
  );

  console.info(
    `baseline: ${original.length} (±0.00%) [${formatDuration(
      originalDuration
    )}]`
  );

  console.info(
    `basic: ${basic.length} (±0.00%) [${formatDuration(basicDuration)}]`
  );

  console.info(
    `minify: ${minified.length} (${(
      ((minified.length - original.length) / original.length) *
      100
    ).toFixed(2)}%) [${formatDuration(minifiedDuration)}]`
  );

  console.info(
    `compress: ${compressed.length} (${(
      ((compressed.length - original.length) / original.length) *
      100
    ).toFixed(2)}%) [${formatDuration(compressedDuration)}]`
  );

  console.info(
    `minify + compress: ${minifiedAndCompressed.length} (${(
      ((minifiedAndCompressed.length - original.length) / original.length) *
      100
    ).toFixed(2)}%) [${formatDuration(minifiedAndCompressedDuration)}]`
  );
};

describe('[stringify] performance', () => {
  it('stringify with ~650KB json data', async () => {
    const data = require('./dataset/ne_110m_populated_places.json');
    test(data);
  });

  it('stringify with ~50MB json data', async () => {
    const data = require('./dataset/ne_10m_roads.json');
    test(data);
  });
});
