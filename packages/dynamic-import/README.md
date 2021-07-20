# dynamic-import

Dynamically import ES modules from HTTP(S) URLs, similar to Deno.

### Usage

Set `NODE_OPTIONS=--experimental-vm-modules` to enable support for [vm.Module](https://nodejs.org/api/vm.html#vm_class_vm_module).

```js
import dynamicImport from '@mfellner/dynamic-import';

const { random } = await dynamicImport('https://cdn.skypack.dev/lodash-es');
```

Some modules require a context to provide certain global variables:

```js
import dynamicImport from '@mfellner/dynamic-import';
import { webcrypto } from 'crypto';

const { v4: uuidv4 } = await dynamicImport('https://cdn.skypack.dev/uuid', {
  crypto: webcrypto,
});
```

It's also possible to provide an import map to resolve bare module specifiers:

```js
const { lstat } = await dynamicImport(
  'fs',
  {},
  { imports: { fs: 'node:fs/promises' } },
);
```

### More information

Blog post: [Dynamic import with HTTP URLs in Node.js](https://dev.to/mxfellner/dynamic-import-with-http-urls-in-node-js-7og)
