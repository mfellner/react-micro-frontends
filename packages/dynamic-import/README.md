# dynamic-import

Dynamically import ES modules from HTTP(S) URLs, similar to Deno.

### Usage

Set `NODE_OPTIONS=--experimental-vm-modules` to enable support for [vm.Module](https://nodejs.org/api/vm.html#vm_class_vm_module).

```js
import dynamicImport from '@mfellner/dynamic-import';

const { v4 as uuidv4 } = await dynamicImport('https://cdn.skypack.dev/uuid');
```
