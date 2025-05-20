const { existsSync } = require('node:fs')

const ensureNoCompetingPlugin = require('./helpers/ensureNoCompetingPlugin')
const fixOutputDir = require('./helpers/fixOutputDir')
const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const { getAngularVersion } = require('./helpers/getPackageVersion')
const { fixServerTs, revertServerTsFix } = require('./helpers/serverModuleHelpers')
const { getBuildInformation, setUpEdgeFunction } = require('./helpers/setUpEdgeFunction')
const setUpHeaders = require('./helpers/setUpHeaders')
const validateAngularVersion = require('./helpers/validateAngularVersion')

let isValidAngularProject = true
let usedEngine

module.exports = {
  async onPreBuild({ netlifyConfig, utils, constants }) {
    const { failBuild, failPlugin } = utils.build
    const { siteRoot, workspaceType } = getAngularRoot({ failBuild, netlifyConfig })
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
      workspaceType,
      packagePath: constants.PACKAGE_PATH,
    })

    usedEngine = await fixServerTs({
      angularVersion,
      siteRoot,
      failPlugin,
      failBuild,
      workspaceType,
      packagePath: constants.PACKAGE_PATH,
    })
  },
  async onBuild({ utils, netlifyConfig, constants }) {
    await revertServerTsFix()
    if (!isValidAngularProject) {
      return
    }

    const { failBuild, failPlugin } = utils.build

    const { siteRoot, workspaceType } = getAngularRoot({ failBuild, netlifyConfig, onBuild: true })
    const angularJson = getAngularJson({ failPlugin, siteRoot, workspaceType, packagePath: constants.PACKAGE_PATH })

    const { outputPath } = getBuildInformation(angularJson, failBuild, workspaceType)
    if (!outputPath || !existsSync(outputPath)) {
      return failBuild('Could not find build output directory')
    }

    await setUpHeaders({ outputPath, netlifyConfig })

    await setUpEdgeFunction({
      outputPath,
      constants,
      failBuild,
      usedEngine,
    })
  },
  async onEnd() {
    await revertServerTsFix()
  },
}
