const { readJSON } = require('fs-extra')
const { satisfies } = require('semver')

/**
 * Ensure site is using Angular v17+.
 * @param {string} root
 * @returns {Promise<boolean>}
 */
const validateAngularVersion = async function (root) {
  let packagePath
  try {
    // eslint-disable-next-line n/no-missing-require
    packagePath = require.resolve('@angular/core/package.json', { paths: [root] })
  } catch {
    // module not found
    console.warn('This site does not seem to be using Angular.')
    return false
  }

  const { version } = await readJSON(packagePath)
  if (!satisfies(version, '>=17.0.0-rc', { includePrerelease: true })) {
    console.warn(`This site does not seem to be using Angular 17 or later. Found: ${version}.`)
    return false
  }

  return true
}

module.exports = validateAngularVersion
