const { join } = require('path')
const process = require('process')

const getAngularJson = require('./getAngularJson')
const { getProject } = require('./setUpEdgeFunction')

const fixOutputDir = async function ({ failBuild, siteRoot, PUBLISH_DIR, netlifyConfig }) {
  const isBuildbot = process.env.CI

  const angularJson = getAngularJson({ failBuild, siteRoot })
  const project = getProject(angularJson)

  const { outputPath } = project.architect.build.options

  const correctPublishDir = join(outputPath, 'browser')
  if (correctPublishDir === PUBLISH_DIR) {
    return
  }

  if (isBuildbot) {
    failBuild(`Publish directory is configured incorrectly. Please set it to "${correctPublishDir}".`)
  } else {
    console.warn(`Publish directory is configured incorrectly. Updating to "${correctPublishDir}".`)
    netlifyConfig.build.publish = correctPublishDir
  }
}

module.exports = fixOutputDir
