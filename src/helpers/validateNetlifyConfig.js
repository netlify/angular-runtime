const { redBright, yellowBright } = require('chalk')

// Validate config build command publish dir
const validateNetlifyConfig = function ({ failBuild, netlifyConfig, angularJson }) {
  const { build } = netlifyConfig
  const { defaultProject: projectName } = angularJson

  const BUILD_COMMAND = `ng build --configuration production && ng run ${projectName}:serverless:production`
  const PUBLISH_DIR = 'dist/netlify-serverless/browser'


  if (!build.command) {
    netlifyConfig.build.command = BUILD_COMMAND
  } else {
    // Warn because they may have this slightly modified or in an npm script and very difficult to accurately check
    console.log(
      redBright`⚠️  Warning: It looks like you've already set a custom build command. Your build command should be or include: ${BUILD_COMMAND}.  ⚠️`,
    )
  }

  if (!build.publish) {
    netlifyConfig.build.publish = PUBLISH_DIR
  } else {
    // Fail because publish dir can only be one thing
    return failBuild(
      `⚠️  Warning: It looks like you've already set a custom publish directory. Your publish directory should be: ${PUBLISH_DIR}.  ⚠️`
    )
  }
}

// This _might_ be better suited for the schematic, unclear

module.exports = validateNetlifyConfig
