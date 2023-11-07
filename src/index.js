const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const setUpEdgeFunction = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

module.exports = {
  async onPreBuild({ utils, netlifyConfig }) {
    const { failPlugin } = utils.build
    await validateAngularVersion({ failPlugin, run: utils.run })

    netlifyConfig.build.command ??= 'npm run build'
  },
  async onBuild({ utils, netlifyConfig, constants }) {
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
