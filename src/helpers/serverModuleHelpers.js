const { existsSync } = require('node:fs')
const { readFile, writeFile, rename, rm } = require('node:fs/promises')
const { parse, join } = require('node:path')

const { satisfies } = require('semver')

const getAngularJson = require('./getAngularJson')
const { getEngineBasedOnKnownSignatures } = require('./serverTsSignature')
const { getProject } = require('./setUpEdgeFunction')

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsCommonEngine = /* typescript */ `import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine'

const commonEngine = new CommonEngine()

export async function netlifyCommonEngineHandler(request: Request, context: any): Promise<Response> {
  return await render(commonEngine)
}
`

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsAppEngine = /* typescript */ `import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/context'

const angularAppEngine = new AngularAppEngine()

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext()

  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
`

let needSwapping = false
let serverModuleLocation
let serverModuleBackupLocation

/**
 * Inspect content of server module and determine which engine is used
 * @param {string} serverModuleContents
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
const guessUsedEngine = function (serverModuleContents) {
  const containsAppEngineKeywords =
    serverModuleContents.includes('AngularAppEngine') || serverModuleContents.includes('AngularNodeAppEngine')
  const containsCommonEngineKeywords = serverModuleContents.includes('CommonEngine')

  if (containsAppEngineKeywords && containsCommonEngineKeywords) {
    // keywords for both engine found - we can't determine which one is used
    return
  }

  if (containsAppEngineKeywords) {
    return 'AppEngine'
  }

  if (containsCommonEngineKeywords) {
    return 'CommonEngine'
  }

  // no keywords found - we can't determine which engine is used
}

/**
 * For Angular@19+ we inspect user's server.ts and if it's one of known defaults that are generated when scaffolding
 * new Angular app with SSR enabled - we will automatically swap it out with Netlify compatible server.ts using same Angular
 * Engine. Swapping just known server.ts files ensures that we are not losing any customizations user might have made.
 * In case server.ts file is not known and our checks decide that it's not Netlify compatible (we are looking for specific keywords
 * that would be used for named exports) - we will fail the build and provide user with instructions on how to replace server.ts
 * to make it Netlify compatible and which they can apply request handling customizations to it (or just leave default in if they generally
 * have default one that just missed our known defaults comparison potentially due to custom formatting etc).
 * @param {Object} obj
 * @param {string} obj.angularVersion Angular version
 * @param {string} obj.siteRoot Root directory of an app
 * @param {(msg: string) => never} obj.failPlugin Function to fail the plugin
 * * @param {(msg: string) => never} obj.failBuild Function to fail the build
 *
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
const fixServerTs = async function ({ angularVersion, siteRoot, failPlugin, failBuild }) {
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
    return
  }

  // check wether project is using stable CommonEngine or Developer Preview AppEngine
  const serverModuleContents = await readFile(serverModuleLocation, 'utf8')

  const usedEngineBasedOnKnownSignatures = getEngineBasedOnKnownSignatures(serverModuleContents)
  if (usedEngineBasedOnKnownSignatures) {
    needSwapping = true

    console.log(
      `Default server.ts using ${usedEngineBasedOnKnownSignatures} found. Automatically swapping to Netlify compatible server.ts.`,
    )

    const parsed = parse(serverModuleLocation)

    serverModuleBackupLocation = join(parsed.dir, `${parsed.name}.original${parsed.ext}`)

    await rename(serverModuleLocation, serverModuleBackupLocation)

    if (usedEngineBasedOnKnownSignatures === 'CommonEngine') {
      await writeFile(serverModuleLocation, NetlifyServerTsCommonEngine)
    } else if (usedEngineBasedOnKnownSignatures === 'AppEngine') {
      await writeFile(serverModuleLocation, NetlifyServerTsAppEngine)
    }
    return usedEngineBasedOnKnownSignatures
  }

  // if we can't determine engine based on known signatures, let's first try to check if module is already
  // Netlify compatible to determine if it can be used as is or if user intervention is required
  // we will look for "netlify<Engine>Handler" which is named export that we will rely on and it's existence will
  // be quite strong indicator that module is already compatible and doesn't require any changes

  const isNetlifyAppEngine = serverModuleContents.includes('netlifyAppEngineHandler')
  const isNetlifyCommonEngine = serverModuleContents.includes('netlifyCommonEngineHandler')

  if (isNetlifyAppEngine && isNetlifyCommonEngine) {
    // both exports found - we can't determine which engine is used
    failBuild(
      "server.ts seems to contain both 'netlifyAppEngineHandler' and 'netlifyCommonEngineHandler' - it should contain just one of those.",
    )
  }

  if (isNetlifyAppEngine) {
    return 'AppEngine'
  }

  if (isNetlifyCommonEngine) {
    return 'CommonEngine'
  }

  // at this point we know that user's server.ts is not Netlify compatible so user intervention is required
  // we will try to inspect server.ts to determine which engine is used and provide more accurate error message
  const guessedUsedEngine = guessUsedEngine(serverModuleContents)

  let errorMessage = `server.ts doesn't seem to be Netlify compatible and is not known default. Please replace it with Netlify compatible server.ts.`
  if (guessedUsedEngine) {
    const alternativeEngine = guessedUsedEngine === 'AppEngine' ? 'CommonEngine' : 'AppEngine'

    errorMessage += `\n\nIt seems like you use "${guessedUsedEngine}" - for this case your server.ts file should contain following:\n\n\`\`\`\n${
      guessedUsedEngine === 'CommonEngine' ? NetlifyServerTsCommonEngine : NetlifyServerTsAppEngine
    }\`\`\``
    errorMessage += `\n\nIf you want to use "${alternativeEngine}" instead - your server.ts file should contain following:\n\n\`\`\`\n${
      alternativeEngine === 'CommonEngine' ? NetlifyServerTsCommonEngine : NetlifyServerTsAppEngine
    }\`\`\``
  } else {
    errorMessage += `\n\nIf you want to use "CommonEngine" - your server.ts file should contain following:\n\n\`\`\`\n${NetlifyServerTsCommonEngine}\`\`\``
    errorMessage += `\n\nIf you want to use "AppEngine" - your server.ts file should contain following:\n\n\`\`\`\n${NetlifyServerTsAppEngine}\`\`\``
  }

  failBuild(errorMessage)
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
