import fetch from 'node-fetch';
import vm from 'vm';
import { builtinModules } from 'module';

/**
 * @param {string} url - URL of a source code file.
 * @returns {Promise<string>} Raw source code.
 */
async function fetchCode(url) {
  const response = await fetch(url);
  if (response.ok) {
    return response.text();
  } else {
    throw new Error(
      `Error fetching ${url}: ${response.statusText}`,
    );
  }
}

/**
 * @param {URL} url
 * @param {vm.Context} context
 * @returns {Promise<vm.Module>}
 */
async function createModuleFromURL(url, context) {
  const identifier = url.toString();

  if (
    url.protocol === 'http:' ||
    url.protocol === 'https:'
  ) {
    // Download the code (naive implementation!)
    const source = await fetchCode(identifier);
    // Instantiate a ES module from raw source code.
    return new vm.SourceTextModule(source, {
      identifier,
      context,
    });
  } else if (url.protocol === 'node:') {
    const imported = await import(identifier);
    const exportNames = Object.keys(imported);

    return new vm.SyntheticModule(
      exportNames,
      function () {
        for (const name of exportNames) {
          this.setExport(name, imported[name]);
        }
      },
      { identifier, context },
    );
  } else {
    // Other possible schemes could be file: and data:
    // See https://nodejs.org/api/esm.html#esm_urls
    throw new Error(
      `Unsupported URL scheme: ${url.protocol}`,
    );
  }
}

/**
 * @typedef {object} ImportMap
 * @property {NodeJS.Dict<string>} imports
 *
 * @param {ImportMap} importMap Import map object.
 * @returns Link function.
 */
async function linkWithImportMap({ imports }) {
  /**
   * @param {string} specifier
   * @param {vm.SourceTextModule} referencingModule
   * @returns {Promise<vm.SourceTextModule>}
   */
  return async function link(specifier, referencingModule) {
    let url;
    if (builtinModules.includes(specifier)) {
      // If the specifier is a bare module specifier for a Node.js builtin,
      // a valid "node:" protocol URL is created for it.
      url = new URL('node:' + specifier);
    } else if (url in imports) {
      // If the specifier is contained in the import map, it is used from there.
      url = new URL(imports[specifier]);
    } else {
      // If the specifier is a bare module specifier, but not contained
      // in the import map, it will be resolved against the parent
      // identifier. E.g., "foo" and "https://cdn.skypack.dev/bar" will
      // resolve to "https://cdn.skypack.dev/foo". Relative specifiers
      // will also be resolved against the parent, as expected.
      url = new URL(
        specifier,
        referencingModule.identifier,
      );
    }
    return createModuleFromURL(
      url,
      referencingModule.context,
    );
  };
}

/**
 * @param {string} url - URL of a source code file.
 * @param {vm.Context} sandbox - Optional execution context.
 * @param {ImportMap} importMap Optional Path to import_map.json file or object.
 * @returns {Promise<any>} Result of the evaluated code.
 */
export default async function dynamicImport(
  specifier,
  sandbox = {},
  { imports = {} } = { imports: {} },
) {
  // Take a specifier from the import map or use it directly. The
  // specifier must be a valid URL.
  const url =
    specifier in imports
      ? new URL(imports[specifier])
      : new URL(specifier);
  // Create an execution context that provides global variables.
  const context = vm.createContext({ ...sandbox });
  // Create the ES module.
  const mod = await createModuleFromURL(url, context);
  // Create a "link" function that uses an optional import map.
  const link = await linkWithImportMap({ imports });
  // Resolve additional imports in the module.
  await mod.link(link);
  // Execute any imperative statements in the module's code.
  await mod.evaluate();
  // The namespace includes the exports of the ES module.
  return mod.namespace;
}
