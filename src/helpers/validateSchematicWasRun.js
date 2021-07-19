// Check that Netlify serverless schematic jobs were run
const validateSchematicWasRun = function ({ failBuild, angularJson, projectName }) {
  if (!projectName) {
    return failBuild('No value defined for projectName. Check plugin inputs in netlify.toml.')
  }

  if (!angularJson.projects[projectName]) {
    return failBuild(`No project found in angular.json by the name of: ${projectName}.`)
  }

  const schematicNotRunError = `You need to run 'ng add netlify-schematics && ng generate netlify-schematics:universal' in your project.`
  if (!angularJson.projects[projectName].architect.serverless) {
    return failBuild(schematicNotRunError)
  }
}

module.exports = validateSchematicWasRun
