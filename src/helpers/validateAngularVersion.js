const { readJSON } = require('fs-extra')
const { satisfies } = require('semver')

/**
 * Ensure site is using Angular v17+.
 * @param {string} root
 * @returns {Promise<boolean>}
 */
const validateAngularVersion = async function (root) {
  // eslint-disable-next-line n/no-missing-require
  const packagePath = require.resolve('@angular/core/package.json', { paths: [root] })
  if (!packagePath) {
    console.warn('This site does not seem to be using Angular.')
    return false
  }

  const { version } = await readJSON(packagePath)
  if (!satisfies(version, '^17.0.0-rc')) {
    console.warn(`This site does not seem to be using Angular 17.`)
    return false
  }

  return true
}

module.exports = validateAngularVersion
