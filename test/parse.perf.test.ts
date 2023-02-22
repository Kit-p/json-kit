import { describe, it } from '@jest/globals';
import { JsonKit } from '../src';
import { formatDuration, timer } from './util';

const test = (data: any): void => {
  const [original, originalStringifyDuration] = timer(() =>
    JSON.stringify(data)
  );
  const [, originalDuration] = timer(() => JSON.parse(original));

  const [basic, basicStringifyDuration] = timer(() => JsonKit.stringify(data));
  const [, basicDuration] = timer(() =>
    JsonKit.parse(basic, { unminify: false, decompress: false })
  );

  const [minified, minifiedStringifyDuration] = timer(() =>
    JsonKit.stringify(data, { minify: true })
  );
  const [, unminifiedDuration] = timer(() =>
    JsonKit.parse(minified, { unminify: true, decompress: false })
  );

  const [compressed, compressedStringifyDuration] = timer(() =>
    JsonKit.stringify(data, { compress: true })
  );
  const [, decompressedDuration] = timer(() =>
    JsonKit.parse(compressed, { unminify: false, decompress: true })
  );

  const [minifiedAndCompressed, minifiedAndCompressedStringifyDuration] = timer(
    () =>
      JsonKit.stringify(data, {
        minify: true,
        compress: true,
      })
  );
  const [, unminifiedAndDecompressedDuration] = timer(() =>
    JsonKit.parse(minifiedAndCompressed, {
      unminify: true,
      decompress: true,
    })
  );

  console.info(
    `baseline: [parse: ${formatDuration(
      originalDuration
    )} (±0.00%)] [stringify: ${formatDuration(
      originalStringifyDuration
    )} (±0.00%)]`
  );

  console.info(
    `basic: [parse: ${formatDuration(basicDuration)} (${(
      ((basicDuration - originalDuration) / originalDuration) *
      100
    ).toFixed(2)}%)] [stringify: ${formatDuration(basicStringifyDuration)} (${(
      ((basicStringifyDuration - originalStringifyDuration) /
        originalStringifyDuration) *
      100
    ).toFixed(2)}%)]`
  );

  console.info(
    `unminify: [parse: ${formatDuration(unminifiedDuration)} (${(
      ((unminifiedDuration - originalDuration) / originalDuration) *
      100
    ).toFixed(2)}%)] [stringify: ${formatDuration(
      minifiedStringifyDuration
    )} (${(
      ((minifiedStringifyDuration - originalStringifyDuration) /
        originalStringifyDuration) *
      100
    ).toFixed(2)}%)]`
  );

  console.info(
    `decompress: [parse: ${formatDuration(decompressedDuration)} (${(
      ((decompressedDuration - originalDuration) / originalDuration) *
      100
    ).toFixed(2)}%)] [stringify: ${formatDuration(
      compressedStringifyDuration
    )} (${(
      ((compressedStringifyDuration - originalStringifyDuration) /
        originalStringifyDuration) *
      100
    ).toFixed(2)}%)]`
  );

  console.info(
    `unminify + decompress: [parse: ${formatDuration(
      unminifiedAndDecompressedDuration
    )} (${(
      ((unminifiedAndDecompressedDuration - originalDuration) /
        originalDuration) *
      100
    ).toFixed(2)}%)] [stringify: ${formatDuration(
      minifiedAndCompressedStringifyDuration
    )} (${(
      ((minifiedAndCompressedStringifyDuration - originalStringifyDuration) /
        originalStringifyDuration) *
      100
    ).toFixed(2)}%)]`
  );
};

describe('[parse] performance', () => {
  it('parse with ~650KB json data', async () => {
    const data = await import('./dataset/ne_110m_populated_places.json');
    test(data);
  });

  it('parse with ~50MB json data', async () => {
    const data = await import('./dataset/ne_10m_roads.json');
    test(data);
  });
});
