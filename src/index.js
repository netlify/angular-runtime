const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const setUpEdgeFunction = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

module.exports = {
  async onPreBuild({ utils, netlifyConfig }) {
    const { failBuild } = utils.build
    await validateAngularVersion({ failBuild, run: utils.run })

    netlifyConfig.build.command ??= 'npm run build'
  },
  async onBuild({ utils, netlifyConfig, constants }) {
    const { failBuild } = utils.build

    const siteRoot = getAngularRoot({ netlifyConfig })
    const angularJson = getAngularJson({ failBuild, siteRoot })

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
