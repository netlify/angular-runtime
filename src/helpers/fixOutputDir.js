const { join } = require('path')

const getAngularJson = require('./getAngularJson')
const { getProject } = require('./setUpEdgeFunction')

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
  const project = getProject(angularJson, failBuild, workspaceType === 'nx')

  const { outputPath } = workspaceType === 'nx' ? project.targets.build.options : project.architect.build.options

  const isApplicationBuilder =
    workspaceType === 'nx'
      ? project.targets.build.executor.endsWith(':application')
      : project.architect.build.builder.endsWith(':application')
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
