const { redBright, yellowBright } = require('chalk')

// Validate config build command publish dir
const validateNetlifyConfig = function ({ failBuild, netlifyConfig, projectName }) {
  const { build } = netlifyConfig

  const BUILD_COMMAND = `ng build --configuration production && ng run ${projectName}:serverless:production`
  const PUBLISH_DIR = 'dist/netlify-serverless/browser'

  if (!build.command) {
    build.command = BUILD_COMMAND
  } else {
    // Warn because they may have this slightly modified or in an npm script and very difficult to accurately check
    const commandWarning = `⚠️  Warning: It looks like you've already set a custom build command. Your build command should be or include: ${BUILD_COMMAND}.  ⚠️`
    console.log(redBright(commandWarning))
  }

  if (!build.publish) {
    build.publish = PUBLISH_DIR
  } else {
    const publishWarning = `⚠️  Warning: It looks like you've already set a custom publish directory: ${build.publish}. Your publish directory should be: '{BASE_DIR}/${PUBLISH_DIR}'.`
    // Warn about publish dir
    console.log(redBright(publishWarning))
  }
}

module.exports = validateNetlifyConfig
