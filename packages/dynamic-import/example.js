import { webcrypto } from 'crypto';
import dynamicImport from './index.js';

async function main() {
  // Import lodash-es
  const { random } = await dynamicImport('https://cdn.skypack.dev/lodash-es');
  random();

  // Import uuid which depends on the global "crypto"
  const { v4: uuidv4 } = await dynamicImport('https://cdn.skypack.dev/uuid', {
    crypto: webcrypto,
  });
  uuidv4();

  // Import a native node module using an import map
  const { lstat } = await dynamicImport(
    'fs',
    {},
    { imports: { fs: 'node:fs/promises' } },
  );
  await lstat('.');
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
