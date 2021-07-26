const addAngularServerlessFiles = require('./helpers/addAngularServerlessFiles')
const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const setUpBuilderFunction = require('./helpers/setUpBuilderFunction')
const setUpFunctionsConfig = require('./helpers/setUpFunctionsConfig')
const setUpRedirects = require('./helpers/setUpRedirects')
const updateAngularJson = require('./helpers/updateAngularJson')
const validateAngularUniversalUsage = require('./helpers/validateAngularUniversalUsage')
const validateNetlifyConfig = require('./helpers/validateNetlifyConfig')

module.exports = {
  async onPreBuild({ netlifyConfig, utils }) {
    const { failBuild } = utils.build

    validateAngularUniversalUsage({ failBuild })

    const siteRoot = getAngularRoot({ failBuild, netlifyConfig })

    const angularJson = getAngularJson({ failBuild, siteRoot })

    const projectName = angularJson.defaultProject

    updateAngularJson({ angularJson, failBuild, projectName, siteRoot })

    validateNetlifyConfig({ failBuild, netlifyConfig, projectName })

    addAngularServerlessFiles({ projectName, siteRoot })
  },
  async onBuild({
    utils,
    netlifyConfig,
    constants: { INTERNAL_FUNCTIONS_SRC, FUNCTIONS_SRC = 'netlify/functions', PUBLISH_DIR },
  }) {
    const { failBuild } = utils.build

    const siteRoot = getAngularRoot({ netlifyConfig })

    const angularJson = getAngularJson({ failBuild, siteRoot })

    const projectName = angularJson.defaultProject

    setUpRedirects({ netlifyConfig })

    setUpFunctionsConfig({ netlifyConfig, projectName, PUBLISH_DIR })

    setUpBuilderFunction({
      FUNCTIONS_SRC: INTERNAL_FUNCTIONS_SRC || FUNCTIONS_SRC,
      publishPath: netlifyConfig.build.publish,
    })
  },
}
