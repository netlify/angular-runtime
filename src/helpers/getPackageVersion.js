const { createRequire } = require('node:module')
const { join } = require('node:path/posix')

const { readJSON } = require('fs-extra')

/**
 * Get Angular version from package.json.
 * @param {string} root
 * @returns {Promise<string | undefined>}
 */
const getAngularVersion = async function (root) {
  let packagePath
  try {
    // eslint-disable-next-line n/no-missing-require
    packagePath = require.resolve('@angular/core/package.json', { paths: [root] })
  } catch {
    // module not found
    return
  }

  const { version } = await readJSON(packagePath)
  return version
}

module.exports.getAngularVersion = getAngularVersion

/**
 * Get Angular Runtime version from package.json.
 * @param {string} root
 * @returns {Promise<string | undefined>}
 */
const getAngularRuntimeVersion = async function (root) {
  let packagePath
  try {
    const siteRequire = createRequire(join(root, ':internal:'))
    packagePath = siteRequire.resolve('@netlify/angular-runtime/package.json')
  } catch {
    // module not found
    return
  }

  const { version } = await readJSON(packagePath)
  return version
}

module.exports.getAngularRuntimeVersion = getAngularRuntimeVersion
