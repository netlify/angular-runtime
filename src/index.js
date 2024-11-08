const ensureNoCompetingPlugin = require('./helpers/ensureNoCompetingPlugin')
const fixOutputDir = require('./helpers/fixOutputDir')
const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const getAngularVersion = require('./helpers/getAngularVersion')
const { fixServerTs, revertServerTsFix } = require('./helpers/serverModuleHelpers')
const { setUpEdgeFunction } = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

let isValidAngularProject = true
let usedEngine

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

    usedEngine = await fixServerTs({ angularVersion, siteRoot, failPlugin })
  },
  async onBuild({ utils, netlifyConfig, constants }) {
    await revertServerTsFix()
    if (!isValidAngularProject) {
      return
    }

    const { failBuild, failPlugin } = utils.build

    const siteRoot = getAngularRoot({ failBuild, netlifyConfig })
    const angularJson = getAngularJson({ failPlugin, siteRoot })

    await setUpEdgeFunction({
      angularJson,
      constants,
      failBuild,
      usedEngine,
    })
  },
}
