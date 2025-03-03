const { existsSync } = require('fs')
const path = require('path')
const process = require('process')

/**
 * If we're in a monorepo then the site root may not be the same as the base directory
 * If there's no angular.json in the root, we instead look for it 2 levels up from the publish dir
 *
 * @returns {{siteRoot: string, workspaceType: 'nx' | 'default'}}
 */
const getAngularRoot = ({ failBuild, netlifyConfig }) => {
  let angularRoot = process.cwd()

  // This could be an NX repo, so check for the existence of nx.json too
  let angularJsonExists = existsSync(path.join(angularRoot, 'angular.json'))
  let nxJsonExists = existsSync(path.join(angularRoot, 'nx.json'))

  if (
    !angularJsonExists &&
    !nxJsonExists &&
    netlifyConfig.build.publish &&
    netlifyConfig.build.publish !== angularRoot
  ) {
    angularRoot = path.dirname(path.resolve(path.join(netlifyConfig.build.publish, '..', '..')))
    angularJsonExists = existsSync(path.join(angularRoot, 'angular.json'))
    nxJsonExists = existsSync(path.join(angularRoot, 'nx.json'))

    if (!angularJsonExists && !nxJsonExists) {
      return failBuild(
        `Could not locate your angular.json/nx.json at your project root or two levels above your publish directory. Make sure your publish directory is set to "{PATH_TO_YOUR_SITE}/dist/{YOUR_PROJECT_NAME}/browser", where {YOUR_PROJECT_NAME} is 'defaultProject' in your angular.json.`,
      )
    }
  }
  return { siteRoot: angularRoot, workspaceType: nxJsonExists ? 'nx' : 'default' }
}

module.exports = getAngularRoot
