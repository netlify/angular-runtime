import { createRequire } from 'node:module'

/**
 * Ensures there's no old version of the same plugin installed.
 * @param {string} root
 * @param {function} failBuild
 * @returns {void}
 */
export default function ensureNoCompetingPlugin(root, failBuild) {
  let packagePath
  try {
    const require = createRequire(import.meta.url)
    packagePath = require.resolve('@netlify/plugin-angular-universal', { paths: [root] })
  } catch {}

  if (packagePath) {
    return failBuild(
      "Detected @netlify/plugin-angular-universal, the old version of Netlify's Angular runtime. Please uninstall it, the new version was set up automatically for you.",
    )
  }
}
