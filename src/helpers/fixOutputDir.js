const { join } = require('path')

const getAngularJson = require('./getAngularJson')
const { getBuildInformation } = require('./setUpEdgeFunction')

const fixOutputDir = async function ({
  failBuild,
  failPlugin,
  siteRoot,
  PUBLISH_DIR,
  IS_LOCAL,
  netlifyConfig,
  workspaceType,
  packagePath,
}) {
  const angularJson = getAngularJson({ failPlugin, siteRoot, workspaceType, packagePath })

  const { outputPath, isApplicationBuilder } = getBuildInformation(angularJson, failBuild, workspaceType)

  const correctPublishDir = isApplicationBuilder ? join(outputPath, 'browser') : outputPath
  if (correctPublishDir === PUBLISH_DIR) {
    return
  }

  if (IS_LOCAL) {
    console.warn(`Publish directory is configured incorrectly. Updating to "${correctPublishDir}".`)
    netlifyConfig.build.publish = correctPublishDir
  } else {
    failBuild(`Publish directory is configured incorrectly. Please set it to "${correctPublishDir}".`)
  }
}

module.exports = fixOutputDir
