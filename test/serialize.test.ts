import { describe, expect, it } from '@jest/globals';
import { JsonKit } from '../src/index.js';

describe('[serialize] serialize', () => {
  const obj = {
    date: new Date(1669902255177),
  };

  it('serialize should transform JavaScript object into Extended JSON object', () => {
    const serializedObj = JsonKit.serialize<{ date: unknown }>(obj);
    expect(serializedObj.date).toHaveProperty('$date');
  });
});

describe('[serialize] deserialize', () => {
  const obj = {
    date: { $date: 1669902255177 },
  };

  it('deserialize should transform Extended JSON object into JavaScript object', () => {
    const deserializedObj = JsonKit.deserialize<{ date: unknown }>(obj);
    expect(deserializedObj.date).toBeInstanceOf(Date);
  });
});
