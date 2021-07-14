import dynamicImport from '.';

describe('dynamic-import', () => {
  test('import cdn.skypack.dev/uuid', async () => {
    const uuid = await dynamicImport('https://cdn.skypack.dev/uuid');
    expect(uuid?.v4).toBeDefined();
  });
});
