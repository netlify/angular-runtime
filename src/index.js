const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const setUpEdgeFunction = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

let isValidAngularProject = true

module.exports = {
  async onPreBuild({ utils, netlifyConfig }) {
    const { failPlugin } = utils.build
    isValidAngularProject = await validateAngularVersion({ failPlugin, run: utils.run })
    if (!isValidAngularProject) {
      console.warn('Skipping build plugin.')
      return
    }

    netlifyConfig.build.command ??= 'npm run build'
  },
  async onBuild({ utils, netlifyConfig, constants }) {
    if (!isValidAngularProject) {
      return
    }

    const { failPlugin } = utils.build

    const siteRoot = getAngularRoot({ netlifyConfig })
    const angularJson = getAngularJson({ failPlugin, siteRoot })

    const projectName = angularJson.defaultProject ?? Object.keys(angularJson.projects)[0]

    await setUpEdgeFunction({
      angularJson,
      projectName,
      constants,
      netlifyConfig,
      failBuild,
    })
  },
}
