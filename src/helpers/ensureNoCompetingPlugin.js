/**
 * Ensures there's no old version of the same plugin installed.
 * @param {string} root
 * @param {function} failBuild
 * @returns {void}
 */
const ensureNoCompetingPlugin = function (root, failBuild) {
  let packagePath
  try {
    // eslint-disable-next-line n/no-missing-require
    packagePath = require.resolve('@netlify/plugin-angular-universal', { paths: [root] })
  } catch {}

  if (packagePath) {
    return failBuild(
      "Detected @netlify/plugin-angular-universal, the old version of Netlify's Angular runtime. Please uninstall it, the new version was set up automatically for you.",
    )
  }
}

module.exports = ensureNoCompetingPlugin
