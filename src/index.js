const addAngularServerlessFiles = require('./helpers/addAngularServerlessFiles')
const copyProjectDist = require('./helpers/copyProjectDist')
const getAngularJson = require('./helpers/getAngularJson')
const setUpBuilderFunction = require('./helpers/setUpBuilderFunction')
const setUpFunctionsConfig = require('./helpers/setUpFunctionsConfig')
const setUpRedirects = require('./helpers/setUpRedirects')
const validateAngularUniversalUsage = require('./helpers/validateAngularUniversalUsage')
const validateNetlifyConfig = require('./helpers/validateNetlifyConfig')
const validateSchematicWasRun = require('./helpers/validateSchematicWasRun')

// Currently unsupported:
// - monorepo structures

module.exports = {
  async onPreBuild({ netlifyConfig, utils, inputs }) {
    const { failBuild } = utils.build
    const { projectName } = inputs

    validateAngularUniversalUsage({ failBuild })

    const angularJson = getAngularJson({ failBuild })

    validateSchematicWasRun({ failBuild, angularJson, projectName })

    validateNetlifyConfig({ failBuild, netlifyConfig, projectName })

    addAngularServerlessFiles()
  },
  async onBuild({ netlifyConfig, constants: { FUNCTIONS_SRC = 'netlify/functions' }, inputs }) {
    copyProjectDist({ projectName: inputs.projectName })

    setUpRedirects({ netlifyConfig })

    setUpFunctionsConfig({ netlifyConfig })

    setUpBuilderFunction({ FUNCTIONS_SRC })
  },
}
