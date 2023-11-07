const getAngularJson = require('./helpers/getAngularJson')
const getAngularRoot = require('./helpers/getAngularRoot')
const setUpEdgeFunction = require('./helpers/setUpEdgeFunction')
const validateAngularVersion = require('./helpers/validateAngularVersion')

let isValidAngularProject = true

module.exports = {
  async onPreBuild({ netlifyConfig }) {
    const siteRoot = getAngularRoot({ netlifyConfig })
    isValidAngularProject = await validateAngularVersion(siteRoot)
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
