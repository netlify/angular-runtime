import { createRequire } from 'node:module'
import { join } from 'node:path/posix'
import { readFile } from 'node:fs/promises'

/**
 * Get Angular version from package.json.
 * @param {string} root
 * @returns {Promise<string | undefined>}
 */
export async function getAngularVersion(root) {
  let packagePath
  try {
    const require = createRequire(import.meta.url)
    // eslint-disable-next-line n/no-missing-require
    packagePath = require.resolve('@angular/core/package.json', { paths: [root] })
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
