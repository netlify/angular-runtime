const ensureNoCompetingPlugin = require('./helpers/ensureNoCompetingPlugin')
const fixOutputDir = require('./helpers/fixOutputDir')
const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const getAngularVersion = require('./helpers/getAngularVersion')
const { setUpEdgeFunction } = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

let isValidAngularProject = true

module.exports = {
  async onPreBuild({ netlifyConfig, utils, constants }) {
    const { failBuild, failPlugin } = utils.build
    const siteRoot = getAngularRoot({ failBuild, netlifyConfig })
    const angularVersion = await getAngularVersion(siteRoot)
    isValidAngularProject = validateAngularVersion(angularVersion)
    if (!isValidAngularProject) {
      console.warn('Skipping build plugin.')
      return
    }

    ensureNoCompetingPlugin(siteRoot, failBuild)

    netlifyConfig.build.command ??= 'npm run build'

    await fixOutputDir({
      siteRoot,
      failBuild,
      failPlugin,
      PUBLISH_DIR: constants.PUBLISH_DIR,
      IS_LOCAL: constants.IS_LOCAL,
      netlifyConfig,
    })
  },
  async onBuild({ utils, netlifyConfig, constants }) {
    if (!isValidAngularProject) {
      return
    }

    const { failBuild, failPlugin } = utils.build

    const siteRoot = getAngularRoot({ failBuild, netlifyConfig })
    const angularJson = getAngularJson({ failPlugin, siteRoot })

    await setUpEdgeFunction({
      angularJson,
      constants,
      netlifyConfig,
      failBuild,
    })
  },
}
