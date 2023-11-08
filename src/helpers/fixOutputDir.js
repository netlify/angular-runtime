const { join } = require('path')

const getAngularJson = require('./getAngularJson')
const { getProject } = require('./setUpEdgeFunction')

const fixOutputDir = async function ({ failBuild, siteRoot, PUBLISH_DIR, IS_LOCAL, netlifyConfig }) {
  const angularJson = getAngularJson({ failBuild, siteRoot })
  const project = getProject(angularJson)

  const { outputPath } = project.architect.build.options

  const correctPublishDir = join(outputPath, 'browser')
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
