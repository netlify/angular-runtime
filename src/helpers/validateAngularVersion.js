const { satisfies } = require('semver')

/**
 * Ensure site is using Angular v17+.
 * @param {string | undefined} version
 * @returns {boolean}
 */
const validateAngularVersion = function (version) {
  if (!version) {
    console.warn('This site does not seem to be using Angular.')
    return false
  }

  if (!satisfies(version, '>=17.0.0-rc', { includePrerelease: true })) {
    console.warn(`This site does not seem to be using Angular 17 or later. Found: ${version}.`)
    return false
  }

  return true
}

module.exports = validateAngularVersion
