const { existsSync } = require('node:fs')
const { readFile, writeFile, rename, rm } = require('node:fs/promises')
const { parse, join } = require('node:path')

const { satisfies } = require('semver')

const getAngularJson = require('./getAngularJson')
const { getProject } = require('./setUpEdgeFunction')

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsCommonEngine = /* typescript */ `import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine'

const commonEngine = new CommonEngine()

export default async function HttpHandler(request: Request, context: any): Promise<Response> {
  return await render(commonEngine)
}
`

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsAppEngine = /* typescript */ `import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
const angularAppEngine = new AngularAppEngine()

// @ts-expect-error - createRequestHandler expects a function with single Request argument and doesn't allow context argument
export const reqHandler = createRequestHandler(async (request: Request, context: any) => {
  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
})
`

let needSwapping = false
let serverModuleLocation
let serverModuleBackupLocation

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
 * For Angular@19+ we inspect user's server.ts and if it uses express, we swap it out with our own.
 * We also check wether CommonEngine or AppEngine is used to provide correct replacement preserving
 * engine of user's choice (CommonEngine is stable, but lacks support for some features, AppEngine is
 * Developer Preview, but has more features and is easier to integrate with - ultimately choice is up to user
 * as AppEngine might have breaking changes outside of major version bumps)
 * @param {Object} obj
 * @param {string} obj.angularVersion Angular version
 * @param {string} obj.siteRoot Root directory of an app
 * @param {(msg: string) => never} obj.failPlugin Function to fail the plugin
 *
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

  serverModuleLocation = build?.options?.ssr?.entry
  if (!serverModuleLocation || !existsSync(serverModuleLocation)) {
    console.log('No SSR setup.')
    return
  }

  // check wether project is using stable CommonEngine or Developer Preview AppEngine
  const serverModuleContents = await readFile(serverModuleLocation, 'utf8')
  /** @type {'AppEngine' | 'CommonEngine'} */
  const usedEngine = getUsedEngine(serverModuleContents) ?? 'CommonEngine'

  // if server module uses express - it means we can't use it and instead we need to provide our own
  needSwapping = serverModuleContents.includes('express')

  if (needSwapping) {
    console.log(`Swapping server.ts to use ${usedEngine}`)

    const parsed = parse(serverModuleLocation)

    serverModuleBackupLocation = join(parsed.dir, `${parsed.name}.original${parsed.ext}`)

    await rename(serverModuleLocation, serverModuleBackupLocation)

    if (usedEngine === 'CommonEngine') {
      await writeFile(serverModuleLocation, NetlifyServerTsCommonEngine)
    } else if (usedEngine === 'AppEngine') {
      await writeFile(serverModuleLocation, NetlifyServerTsAppEngine)
    }
  }

  return usedEngine
}

module.exports.fixServerTs = fixServerTs

const revertServerTsFix = async function () {
  if (needSwapping && serverModuleLocation && serverModuleBackupLocation) {
    await rm(serverModuleLocation)
    await rename(serverModuleBackupLocation, serverModuleLocation)
    // set it to false to not attempt to swap back more times than one
    // as we call this in couple hooks to try to ensure it's reverted in case of success and failures, etc
    needSwapping = false
  }
}

module.exports.revertServerTsFix = revertServerTsFix
