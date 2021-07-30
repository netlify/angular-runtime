const { yellowBright } = require('chalk')

// Validate config build command publish dir
const validateNetlifyConfig = function ({ failBuild, netlifyConfig, projectName }) {
  const { build } = netlifyConfig

  const BUILD_COMMAND = `ng build --configuration production && ng run ${projectName}:serverless:production`

  if (!build.command) {
    return failBuild(`Missing build command in your netlify.toml or UI configuration. It should be: ${BUILD_COMMAND}`)
  }

  if (build.command !== BUILD_COMMAND || !build.command.includes(BUILD_COMMAND)) {
    const commandWarning = `FYI: You seem to be using a custom build script. Please make sure your script includes: ${BUILD_COMMAND}.`
    console.log(yellowBright(commandWarning))
  }
}

module.exports = validateNetlifyConfig
