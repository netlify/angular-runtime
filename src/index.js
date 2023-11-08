const { rm } = require('fs/promises')
const { join } = require('path')

const ensureNoCompetingPlugin = require('./helpers/ensureNoCompetingPlugin')
const fixOutputDir = require('./helpers/fixOutputDir')
const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const { setUpEdgeFunction } = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

let isValidAngularProject = true

module.exports = {
  async onDev({ constants }) {
    // during local dev, the angular dev server will perform SSR,
    // and we won't have the server output to generate the edge function.
    // removing any edge function generated by a previous build ensures we don't try to use it.
    const edgeFunctionDir = join(constants.INTERNAL_EDGE_FUNCTIONS_SRC, 'angular-ssr')
    await rm(edgeFunctionDir, { recursive: true })
  },
  async onPreBuild({ netlifyConfig, utils, constants }) {
    const siteRoot = getAngularRoot({ netlifyConfig })
    isValidAngularProject = await validateAngularVersion(siteRoot)
    if (!isValidAngularProject) {
      console.warn('Skipping build plugin.')
      return
    }

    ensureNoCompetingPlugin(siteRoot, utils.build.failBuild)

    netlifyConfig.build.command ??= 'npm run build'

    await fixOutputDir({
      siteRoot,
      failBuild: utils.build.failBuild,
      PUBLISH_DIR: constants.PUBLISH_DIR,
      netlifyConfig,
    })
  },
  async onBuild({ utils, netlifyConfig, constants }) {
    if (!isValidAngularProject) {
      return
    }

    const { failBuild } = utils.build

    const siteRoot = getAngularRoot({ netlifyConfig })
    const angularJson = getAngularJson({ failBuild, siteRoot })

    await setUpEdgeFunction({
      angularJson,
      constants,
      netlifyConfig,
      failBuild,
    })
  },
}
