import { existsSync } from 'node:fs'

import ensureNoCompetingPlugin from './helpers/ensureNoCompetingPlugin.js'
import fixOutputDir from './helpers/fixOutputDir.js'
import getAngularJson from './helpers/getAngularJson.js'
import { getAngularRoot } from './helpers/getAngularRoot.js'
import { getAngularCoreVersion, getAngularSsrVersion } from './helpers/getPackageVersion.js'
import { fixServerTs, revertServerTsFix } from './helpers/serverModuleHelpers.js'
import { getBuildInformation, setUpEdgeFunction } from './helpers/setUpEdgeFunction.js'
import { setUpHeaders } from './helpers/setUpHeaders.js'
import { validateAngularVersion } from './helpers/validateAngularVersion.js'

let isValidAngularProject = true
let usedEngine

export async function onPreBuild({ netlifyConfig, utils, constants }) {
  const { failBuild, failPlugin } = utils.build
  const { siteRoot, workspaceType } = getAngularRoot({ failBuild, netlifyConfig })

  // @angular/core and @angular/ssr are only synced to major versions
  // for minor or patch versions, it's not guaranteed to be in sync
  // we need to check versions of both deps as @angular/ssr might not
  // be installed by users not trying to use SSR, but we need
  // patch-version level detection in serverModuleHelpers.js
  const angularCoreVersion = await getAngularCoreVersion(siteRoot)
  const angularSsrVersion = await getAngularSsrVersion(siteRoot)

  isValidAngularProject = validateAngularVersion(angularCoreVersion)

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
    angularCoreVersion,
    angularSsrVersion,
    siteRoot,
    failPlugin,
    failBuild,
    workspaceType,
    packagePath: constants.PACKAGE_PATH,
  })
}

export async function onBuild({ utils, netlifyConfig, constants }) {
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
}

export async function onEnd() {
  await revertServerTsFix()
}
