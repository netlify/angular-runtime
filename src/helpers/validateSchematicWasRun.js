// Check that Netlify serverless schematic jobs were run
const validateSchematicWasRun = function ({ failBuild, angularJson }) {
  const schematicNotRunError = `You need to run 'ng add netlify-schematics && ng generate netlify-schematics:netlify-serverless' in your project.`
  if (!angularJson.projects[angularJson.defaultProject].architect.serverless) {
    return failBuild(schematicNotRunError)
  }
}

module.exports = validateSchematicWasRun
