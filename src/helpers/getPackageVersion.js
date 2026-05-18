import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

/**
 * Get Angular version from package.json.
 * @param {string} root
 * @returns {Promise<string | undefined>}
 */
export async function getAngularVersion(root) {
  let packagePath
  try {
    const require = createRequire(import.meta.url)

    // we're checking @angular/ssr version
    // there could be patch-level differences in this and @angular/core
    // but in serverModuleHelpers.js, we need patch-level matching of the ssr package
    // so we cannot rely on the version of core anymore
    packagePath = require.resolve('@angular/ssr/package.json', { paths: [root] })
  } catch {
    // module not found
    return
  }

  const contents = await readFile(packagePath)
  const { version } = JSON.parse(contents)
  return version
}

/**
 * Get Angular Runtime version from package.json.
 * @param {string} root
 * @returns {Promise<string | undefined>}
 */
export async function getAngularRuntimeVersion(root) {
  let packagePath
  try {
    const siteRequire = createRequire(join(root, ':internal:'))
    packagePath = siteRequire.resolve('@netlify/angular-runtime/package.json')
  } catch {
    // module not found
    return
  }

  const contents = await readFile(packagePath)
  const { version } = JSON.parse(contents)
  return version
}
