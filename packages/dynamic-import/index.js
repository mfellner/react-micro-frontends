import fetch from 'node-fetch';
import vm from 'vm';

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
      `Error fetching ${url}:` + response.statusText,
    );
  }
}

/**
 * @param {string} specifier
 * @param {vm.SourceTextModule} referencingModule
 * @returns {Promise<vm.SourceTextModule>}
 */
async function link(specifier, referencingModule) {
  const url = new URL(
    specifier,
    referencingModule.identifier,
  ).toString();
  const source = await fetchCode(url);
  return new vm.SourceTextModule(source, {
    identifier: url,
    context: referencingModule.context,
  });
}

/**
 * @param {string} url - URL of a source code file.
 * @returns {Promise<any>} Result of the evaluated code.
 */
export default async function dynamicImport(url) {
  const source = await fetchCode(url);

  const context = vm.createContext({});
  const mod = new vm.SourceTextModule(source, {
    identifier: url,
    context,
  });
  await mod.link(link);
  await mod.evaluate();

  return mod.namespace;
}
