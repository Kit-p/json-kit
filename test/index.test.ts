import { JsonKit } from '../src/index.js';

describe('[export] exports', () => {
  const exportedMembers = [
    'Parse',
    'Serialize',
    'Stringify',
    'parse',
    'decompressString',
    'serialize',
    'deserialize',
    'stringify',
    'compressString',
  ] as const;

  it('named export should contain all the exported members', () => {
    exportedMembers.forEach((exportedMember) => {
      expect(JsonKit).toHaveProperty(exportedMember);
    });
  });
});
