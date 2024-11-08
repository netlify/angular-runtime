const { existsSync } = require('node:fs')
const { readFile, writeFile } = require('node:fs/promises')

const { satisfies } = require('semver')

const getAngularJson = require('./getAngularJson')
const { getProject } = require('./setUpEdgeFunction')

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsCommonEngine = /* typescript */ `import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine'

const commonEngine = new CommonEngine()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function HttpHandler(request: Request, context: any): Promise<Response> {
  // customize if you want to have custom request handling

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
  /** @type {'AppEngine' | 'CommonEngine'} */
  const usedEngine = getUsedEngine(serverModuleContents) ?? 'CommonEngine'

  // if server module uses express - it means we can't use it and instead we need to provide our own
  // alternatively we could just compare content (or hash of it) to "known" content of server.ts file
  // that users get when they scaffold new project and only swap if it's known content and fail with
  // actionable message so users know how to adjust their server.ts file to work on Netlify
  // with engine they opted to use
  needSwapping = serverModuleContents.includes('express')

  if (needSwapping) {
    console.log(`Swapping server.ts to use ${usedEngine}`)

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
  if (needSwapping) {
    // TODO: revert swap

    // set it to false to not attempt to swap back more times than one
    // as we call this in couple hooks to try to ensure it's reverted in case of success and failures, etc
    needSwapping = false
  }
}

module.exports.revertServerTsFix = revertServerTsFix
