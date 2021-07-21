const addAngularServerlessFiles = require('./helpers/addAngularServerlessFiles')
const copyProjectDist = require('./helpers/copyProjectDist')
const getAngularJson = require('./helpers/getAngularJson')
const setUpBuilderFunction = require('./helpers/setUpBuilderFunction')
const setUpFunctionsConfig = require('./helpers/setUpFunctionsConfig')
const setUpRedirects = require('./helpers/setUpRedirects')
const updateAngularJson = require('./helpers/updateAngularJson')
const validateAngularUniversalUsage = require('./helpers/validateAngularUniversalUsage')
const validateNetlifyConfig = require('./helpers/validateNetlifyConfig')

// Currently unsupported:
// - monorepo structures

module.exports = {
  async onPreBuild({ netlifyConfig, utils }) {
    const { failBuild } = utils.build

    validateAngularUniversalUsage({ failBuild })

    const siteRoot = process.cwd()
    const angularJson = getAngularJson({ failBuild, siteRoot })
    const projectName = angularJson.defaultProject

    updateAngularJson({ failBuild, angularJson, projectName, siteRoot })

    validateNetlifyConfig({ failBuild, netlifyConfig, projectName })

    addAngularServerlessFiles()
  },
  async onBuild({ utils, netlifyConfig, constants: { INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC = 'netlify/functions' } }) {
    const { failBuild } = utils.build
    const siteRoot = process.cwd()
    const angularJson = getAngularJson({ failBuild, siteRoot })

    copyProjectDist({ projectName: angularJson.defaultProject })

    setUpRedirects({ netlifyConfig })

    setUpFunctionsConfig({ netlifyConfig })

    setUpBuilderFunction({ FUNCTIONS_SRC: INTERNAL_FUNCTIONS_SRC || FUNCTIONS_SRC })
  },
}
