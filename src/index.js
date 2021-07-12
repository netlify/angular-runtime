const addAngularServerlessFiles = require('./helpers/addAngularServerlessFiles')
const getAngularJson = require('./helpers/getAngularJson')
const setUpBuilderFunction = require('./helpers/setUpBuilderFunction')
const setUpFunctionsConfig = require('./helpers/setUpFunctionsConfig')
const setUpRedirects = require('./helpers/setUpRedirects')
const validateAngularUniversalUsage = require('./helpers/validateAngularUniversalUsage')
const validateNetlifyConfig = require('./helpers/validateNetlifyConfig')
const validateSchematicWasRun = require('./helpers/validateSchematicWasRun')

// Currently unsupported:
// - monorepo structure
// - angular.json with multiple projects (or project that isnt the default)

module.exports = {
  async onPreBuild({ netlifyConfig, utils }) {
    const { failBuild } = utils.build

    validateAngularUniversalUsage({ failBuild })

    const angularJson = getAngularJson({ failBuild })

    validateSchematicWasRun({ failBuild, angularJson })

    validateNetlifyConfig({ failBuild, netlifyConfig, angularJson })
  },
  async onBuild({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
    setUpRedirects({ netlifyConfig })

    setUpFunctionsConfig({ netlifyConfig })

    addAngularServerlessFiles()

    setUpBuilderFunction({ FUNCTIONS_SRC })
  },
}
