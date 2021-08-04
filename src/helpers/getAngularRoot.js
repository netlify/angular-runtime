const { existsSync } = require('fs')
const path = require('path')

/**
 * If we're in a monorepo then the site root may not be the same as the base directory
 * If there's no angular.json in the root, we instead look for it 2 levels up from the publish dir
 */
const getAngularRoot = ({ failBuild, netlifyConfig }) => {
  let angularRoot = process.cwd()
  if (
    !existsSync(path.join(angularRoot, 'angular.json')) &&
    netlifyConfig.build.publish &&
    netlifyConfig.build.publish !== angularRoot
  ) {
    angularRoot = path.dirname(path.resolve(path.join(netlifyConfig.build.publish, '..', '..')))

    if (!existsSync(path.join(angularRoot, 'angular.json'))) {
      return failBuild(
        `Could not locate your angular.json at your project root or two levels above your publish directory. Make sure your publish directory is set to "{PATH_TO_YOUR_SITE}/dist/{YOUR_PROJECT_NAME}/browser", where {YOUR_PROJECT_NAME} is 'defaultProject' in your angular.json.`,
      )
    }
  }
  return angularRoot
}

module.exports = getAngularRoot
