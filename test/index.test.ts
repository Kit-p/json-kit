import { main, NotImplementedError } from '../src/index';

describe('main', () => {
  it('should throw error', () => {
    expect(main).toThrow(NotImplementedError);
  });
});

describe('Not Implemented Error', () => {
  it('toString should contain message', () => {
    const err = new NotImplementedError('test');
    expect(err.toString()).toContain('Not Implemented: test');
    expect(err.toString()).not.toEqual('Not Implemented: test');
    err.stack = undefined;
    expect(err.toString()).toEqual(
      'Not Implemented: test\nMissing stack information'
    );
  });
});
