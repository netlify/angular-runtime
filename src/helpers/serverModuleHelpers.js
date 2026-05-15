/* eslint-disable max-lines */
import { existsSync } from 'node:fs'
import { readFile, writeFile, rename, rm } from 'node:fs/promises'
import { parse, join } from 'node:path'

import { satisfies } from 'semver'

import getAngularJson from './getAngularJson.js'
import { getAngularRuntimeVersion } from './getPackageVersion.js'
import { getEngineBasedOnKnownSignatures } from './serverTsSignature.js'
import { getProject } from './setUpEdgeFunction.js'

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsCommonEngine = /* typescript */ `import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine.js'

const commonEngine = new CommonEngine()

export async function netlifyCommonEngineHandler(request: Request, context: any): Promise<Response> {
  // Example API endpoints can be defined here.
  // Uncomment and define endpoints as necessary.
  // const pathname = new URL(request.url).pathname
  // if (pathname === '/api/hello') {
  //   return Response.json({ message: 'Hello from the API' });
  // }

  return await render(commonEngine)
}
`
// eslint-disable-next-line no-inline-comments
const NetlifyServerTsAppEngineCommonContent = /* typescript */ `export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext()

  // Example API endpoints can be defined here.
  // Uncomment and define endpoints as necessary.
  // if (context?.url?.pathname === '/api/hello') {
  //   return Response.json({ message: 'Hello from the API' });
  // }

  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
`

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsAppEngine21Dot2 = /* typescript */ `import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js'

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
})

${NetlifyServerTsAppEngineCommonContent}`

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsAppEngine21Dot1 = /* typescript */ `import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getAllowedHosts, getContext } from '@netlify/angular-runtime/app-engine.js'

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
})

${NetlifyServerTsAppEngineCommonContent}`

// eslint-disable-next-line no-inline-comments
const NetlifyServerTsAppEngine21Dot0 = /* typescript */ `import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/app-engine.js'

const angularAppEngine = new AngularAppEngine()

${NetlifyServerTsAppEngineCommonContent}`

let needSwapping = false
let serverModuleLocation
let serverModuleBackupLocation

/**
 * Inspect content of server module and determine which engine is used
 * @param {string} serverModuleContents
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
function guessUsedEngine(serverModuleContents) {
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
 * @param {'nx' | 'default'} obj.workspaceType The workspace type being parsed
 * @param {string} obj.packagePath The path to the package directory
 * * @param {(msg: string) => never} obj.failBuild Function to fail the build
 *
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
export async function fixServerTs({ angularVersion, siteRoot, failPlugin, failBuild, workspaceType, packagePath }) {
  if (!satisfies(angularVersion, '>=19.0.0-rc', { includePrerelease: true })) {
    // for pre-19 versions, we don't need to do anything
    return
  }

  const angularJson = getAngularJson({ failPlugin, siteRoot, workspaceType, packagePath })

  // Angular v21.1 introduced `allowedHosts`: https://github.com/angular/angular-cli/blob/21.1.x/packages/angular/ssr/src/app-engine.ts
  // Angular v21.2 introduced `trustProxyHeaders` as well: https://github.com/angular/angular-cli/blob/21.2.x/packages/angular/ssr/src/app-engine.ts
  // we cannot add the config if the version doesn't support it
  // because TypeScript complains about invalid properties
  let NetlifyServerTsAppEngine = NetlifyServerTsAppEngine21Dot0
  if (satisfies(angularVersion, '>=21.2.0', { includePrerelease: true })) {
    NetlifyServerTsAppEngine = NetlifyServerTsAppEngine21Dot2
  } else if (satisfies(angularVersion, '>=21.1.0', { includePrerelease: true })) {
    NetlifyServerTsAppEngine = NetlifyServerTsAppEngine21Dot1
  }

  const project = getProject(angularJson, failBuild, workspaceType === 'nx')
  const build = workspaceType === 'nx' ? project.targets.build : project.architect.build

  serverModuleLocation = build?.options?.ssr?.entry
  if (!serverModuleLocation || !existsSync(serverModuleLocation)) {
    return
  }

  // check if user has installed runtime package and if the version is 2.2.0 or newer
  // userspace `server.ts` file does import utils from runtime, so it has to be resolvable
  // from site root and auto-installed plugin in `.netlify/plugins` wouldn't suffice for that.
  const angularRuntimeVersionInstalledByUser = await getAngularRuntimeVersion(siteRoot)
  if (!angularRuntimeVersionInstalledByUser) {
    failBuild(
      `Angular@${angularVersion} SSR on Netlify requires '@netlify/angular-runtime' version 2.2.0 or later to be installed. Please install it and try again.`,
    )
  } else if (!satisfies(angularRuntimeVersionInstalledByUser, '>=2.2.0', { includePrerelease: true })) {
    failBuild(
      `Angular@${angularVersion} SSR on Netlify requires '@netlify/angular-runtime' version 2.2.0 or later to be installed. Found version "${angularRuntimeVersionInstalledByUser}". Please update it to version 2.2.0 or later and try again.`,
    )
  }

  // check whether project is using CommonEngine or AppEngine
  const serverModuleContents = await readFile(serverModuleLocation, 'utf8')

  const usedEngineBasedOnKnownSignatures = getEngineBasedOnKnownSignatures(serverModuleContents)
  if (usedEngineBasedOnKnownSignatures) {
    needSwapping = true

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

  const moreDetailsInRepoReadme = `\n\nCheck https://github.com/netlify/angular-runtime README for more details.`

  // if we can't determine engine based on known signatures, let's first try to check if module is already
  // Netlify compatible to determine if it can be used as is or if user intervention is required
  // we will look for "netlify<Engine>Handler" which is named export that we will rely on and it's existence will
  // be quite strong indicator that module is already compatible and doesn't require any changes

  const isNetlifyAppEngine = serverModuleContents.includes('netlifyAppEngineHandler')
  const isNetlifyCommonEngine = serverModuleContents.includes('netlifyCommonEngineHandler')

  if (isNetlifyAppEngine && isNetlifyCommonEngine) {
    // both exports found - we can't determine which engine is used
    failBuild(
      `server.ts seems to contain both 'netlifyAppEngineHandler' and 'netlifyCommonEngineHandler' - it should contain just one of those.${moreDetailsInRepoReadme}`,
    )
  }

  if (isNetlifyAppEngine) {
    return 'AppEngine'
  }

  if (isNetlifyCommonEngine) {
    return 'CommonEngine'
  }

  if (satisfies(angularVersion, '<20', { includePrerelease: true })) {
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

    errorMessage += moreDetailsInRepoReadme

    failBuild(errorMessage)
  } else {
    // Angular 20+ made App Engine stable, so we should not recommend Common Engine anymore
    failBuild(
      `server.ts doesn't seem to be Netlify compatible and is not known default. Please replace it with Netlify compatible server.ts:\n\n\`\`\`\n${NetlifyServerTsAppEngine}\`\`\`${moreDetailsInRepoReadme}`,
    )
  }
}

export async function revertServerTsFix() {
  if (needSwapping && serverModuleLocation && serverModuleBackupLocation) {
    await rm(serverModuleLocation)
    await rename(serverModuleBackupLocation, serverModuleLocation)
    // set it to false to not attempt to swap back more times than one
    // as we call this in couple hooks to try to ensure it's reverted in case of success and failures, etc
    needSwapping = false
  }
}
/* eslint-enable max-lines */
