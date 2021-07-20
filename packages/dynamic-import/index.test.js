import { webcrypto } from 'crypto';
import dynamicImport from '.';

describe('dynamic-import', () => {
  test('import cdn.skypack.dev/uuid', async () => {
    const uuid = await dynamicImport('https://cdn.skypack.dev/uuid', {
      crypto: webcrypto,
    });
    expect(uuid?.v4('test')).toBeDefined();
  });

  test('import cdn.skypack.dev/lodash-es', async () => {
    const lodash = await dynamicImport('https://cdn.skypack.dev/lodash-es');
    expect(typeof lodash?.random).toBe('function');
  });

  // Currently not supported by Jest.
  test.skip('import "fs" with import map', async () => {
    const fs = await dynamicImport(
      'fs',
      {},
      { imports: { fs: 'node:fs/promises' } },
    );
    expect(fs).toBeDefined();
  });

  test('specifier that is not a URL should be rejected', async () => {
    expect(dynamicImport('not-a-url')).rejects.toThrow('Invalid URL');
  });

  test('specifier in import map that is not a URL should be rejected', async () => {
    expect(
      dynamicImport('test', {}, { imports: { test: 'not-a-url' } }),
    ).rejects.toThrow('Invalid URL');
  });
});
