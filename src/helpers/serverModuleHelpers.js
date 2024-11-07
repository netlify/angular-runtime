const { existsSync } = require('node:fs')
const { readFile } = require('node:fs/promises')

const { satisfies } = require('semver')

const getAngularJson = require('./getAngularJson')
const { getProject } = require('./setUpEdgeFunction')

/**
 * Inspect content of server module and determine which engine is used
 * @param {string} serverModuleContents
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
const getUsedEngine = function (serverModuleContents) {
  if (serverModuleContents.includes('AngularAppEngine') || serverModuleContents.includes('AngularNodeAppEngine')) {
    return 'AppEngine'
  }

  if (serverModuleContents.includes('CommonEngine')) {
    return 'CommonEngine'
  }
}

/**
 * TODO: document what's happening here and update types
 * @param {string} angularJson
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
const fixServerTs = async function ({ angularVersion, siteRoot, failPlugin }) {
  if (!satisfies(angularVersion, '>=19.0.0-rc', { includePrerelease: true })) {
    // for pre-19 versions, we don't need to do anything
    return
  }

  const angularJson = getAngularJson({ failPlugin, siteRoot })

  const project = getProject(angularJson)
  const {
    architect: { build },
  } = project

  const serverModuleLocation = build?.options?.ssr?.entry
  if (!serverModuleLocation || !existsSync(serverModuleLocation)) {
    console.log('No SSR setup.')
    return
  }

  // check wether project is using stable CommonEngine or Developer Preview AppEngine
  const serverModuleContents = await readFile(serverModuleLocation, 'utf8')

  // if server module uses express - it means we can't use it and instead we need to provide our own
  // alternatively we could just compare content (or hash of it) to "known" content of server.ts file
  // that users get when they scaffold new project and only swap if it's known content and fail with
  // actionable message so users know how to adjust their server.ts file to work on Netlify
  // with engine they opted to use
  const needSwapping = serverModuleContents.includes('express')

  /** @type {'AppEngine' | 'CommonEngine'} */
  const usedEngine = getUsedEngine(serverModuleContents) ?? 'CommonEngine'

  // TODO: actual swapping of server.ts content (or location in angular.json)

  return usedEngine
}

const revertServerTsFix = async function () {}

module.exports.fixServerTs = fixServerTs
