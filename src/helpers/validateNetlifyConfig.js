const { redBright, yellowBright } = require('chalk')

// Validate config build command publish dir
const validateNetlifyConfig = function ({ failBuild, netlifyConfig, projectName }) {
  const { build } = netlifyConfig

  const BUILD_COMMAND = `ng build --configuration production && ng run ${projectName}:serverless:production`
  const PUBLISH_DIR = `dist/${projectName}/browser`

  // If they have a command or publish directory already set, we inform them what the plugin expects it to be
  // Otherwise, we set it for them
  if (!build.command) {
    build.command = BUILD_COMMAND
  } else {
    const commandWarning = `⚠️  Heads up: It looks like you've already set your build command. The plugin expects your build command to be or include: ${BUILD_COMMAND}.  ⚠️`
    console.log(redBright(commandWarning))
  }

  if (!build.publish) {
    build.publish = PUBLISH_DIR
  } else {
    const publishWarning = `⚠️  Heads up: It looks like you've already set your publish directory: ${build.publish}. The plugin expects your publish directory to be: '{BASE_DIR}/${PUBLISH_DIR}'.  ⚠️`
    console.log(redBright(publishWarning))
  }
}

module.exports = validateNetlifyConfig
