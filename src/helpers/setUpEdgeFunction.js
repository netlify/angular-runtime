/* eslint-disable max-lines */
const { Buffer } = require('node:buffer')
const { readdirSync, existsSync } = require('node:fs')
const { writeFile, mkdir, readFile, copyFile } = require('node:fs/promises')
const { join, relative, sep, posix } = require('node:path')
const process = require('node:process')

const { readJson } = require('fs-extra')

const packageJson = require('../../package.json')

/**
 * Recursively lists all files in a directory.
 */
const getAllFilesIn = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    if (dirent.isDirectory()) {
      return getAllFilesIn(join(dir, dirent.name))
    }
    return [join(dir, dirent.name)]
  })

const toPosix = (path) => path.split(sep).join(posix.sep)

const getProject = (angularJson, failBuild) => {
  const selectedProject = process.env.ANGULAR_PROJECT
  if (selectedProject) {
    const project = angularJson.projects[selectedProject]
    if (!project) {
      return failBuild(
        `Could not find project selected project "${selectedProject}" in angular.json. Please update the ANGULAR_PROJECT environment variable.`,
      )
    }
    return project
  }

  const projectNames = Object.keys(angularJson.projects)
  const [projectName] = projectNames
  if (projectNames.length > 1) {
    console.warn(
      `Found multiple projects in angular.json, deploying "${projectName}". To deploy a different one, set the ANGULAR_PROJECT environment variable to the project name.`,
    )
  }

  return angularJson.projects[projectName]
}

module.exports.getProject = getProject

/**
 * @param {string} outputDir
 * @returns {Promise<string[]>}
 */
const getPrerenderedRoutes = async (outputDir) => {
  const file = join(outputDir, 'prerendered-routes.json')
  if (!existsSync(file)) return []
  const { routes: prerenderedRoutes } = await readJson(file)

  if (!Array.isArray(prerenderedRoutes)) {
    // Angular@19 changes shape of prerendered-routes from array of strings to object with routes as keys
    return Object.keys(prerenderedRoutes)
  }

  // Before Angular@19 prerendered-routes is an array of strings
  return prerenderedRoutes
}

// eslint-disable-next-line max-lines-per-function
const setUpEdgeFunction = async ({ angularJson, constants, failBuild, usedEngine }) => {
  const project = getProject(angularJson)
  const {
    architect: { build },
  } = project
  const outputDir = build?.options?.outputPath
  if (!outputDir || !existsSync(outputDir)) {
    return failBuild('Could not find build output directory')
  }

  const serverDistRoot = join(outputDir, 'server')
  if (!existsSync(serverDistRoot)) {
    console.log('No server output generated, skipping SSR setup.')
    return
  }

  console.log(`Writing Angular SSR Edge Function ...`)

  const edgeFunctionDir = join(constants.INTERNAL_EDGE_FUNCTIONS_SRC, 'angular-ssr')
  await mkdir(edgeFunctionDir, { recursive: true })

  const html = await readFile(join(serverDistRoot, 'index.server.html'), 'utf-8')
  const staticFiles = getAllFilesIn(join(outputDir, 'browser')).map(
    (path) => `/${relative(join(outputDir, 'browser'), path)}`,
  )

  const excludedPaths = ['/.netlify/*', ...staticFiles, ...(await getPrerenderedRoutes(outputDir))].map(toPosix)

  // buy putting this into a separate module that's imported first,
  // we ensure this is initialised before any other module
  const polyfills = `
  import process from "node:process"

  globalThis.process = process
  globalThis.DenoEvent = globalThis.Event // storing this for fixup-event.mjs
  `

  // angular's polyfills override the global `Event` with a custom implementation.
  // Deno local doesn't like that and will throw in local dev while dispatching `new Event("load")`.
  // So we reverse angular's override, and go back to Deno's implementation.
  const fixupEvent = `
  globalThis.Event = globalThis.DenoEvent
  `

  let ssrFunctionContent = ''

  if (!usedEngine) {
    // eslint-disable-next-line no-inline-comments
    ssrFunctionContent = /* javascript */ `
    import { Buffer } from "node:buffer";
    import { renderApplication } from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/render-utils.server.mjs";
    import bootstrap from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/main.server.mjs";
    import "./fixup-event.mjs";

    const document = Buffer.from(${JSON.stringify(
      Buffer.from(html, 'utf-8').toString('base64'),
    )}, 'base64').toString("utf-8");
    
    export default async (request, context) => {
      const html = await renderApplication(bootstrap, {
        url: request.url,
        document,
        platformProviders: [{ provide: "netlify.request", useValue: request }, { provide: "netlify.context", useValue: context }],
      });
      return new Response(html, { headers: { "content-type": "text/html" } });
    };
    `
  } else if (usedEngine === 'CommonEngine') {
    const cssAssetsManifest = {}
    const outputBrowserDir = join(outputDir, 'browser')
    const cssFiles = getAllFilesIn(outputBrowserDir).filter((file) => file.endsWith('.css'))

    for (const cssFile of cssFiles) {
      const content = await readFile(cssFile)
      cssAssetsManifest[`${relative(outputBrowserDir, cssFile)}`] = content.toString('base64')
    }

    // eslint-disable-next-line no-inline-comments
    ssrFunctionContent = /* javascript */ `
    import { Buffer } from "node:buffer";
    import { dirname, relative, resolve } from 'node:path';
    import { fileURLToPath } from 'node:url';

    import Handler from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/server.mjs";
    import bootstrap from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/main.server.mjs";
    import "./fixup-event.mjs";

    const document = Buffer.from(${JSON.stringify(
      Buffer.from(html, 'utf-8').toString('base64'),
    )}, 'base64').toString("utf-8");

    const cssAssetsManifest = ${JSON.stringify(cssAssetsManifest)};

    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, 'browser');

    if (typeof Deno !== 'undefined') {
      try {
        // fs.readFile is not supported in Edge Functions, so this is a workaround for CSS inlining
        // that will intercept readFile attempt and if it's a CSS file, return the content from the manifest
        const originalReadFile = globalThis.Deno.readFile
        globalThis.Deno.readFile = (...args) => {
          try {
            if (args.length > 0 && typeof args[0] === 'string') {
              const relPath = relative(browserDistFolder, args[0])
              if (relPath in cssAssetsManifest) {
                return Promise.resolve(Buffer.from(cssAssetsManifest[relPath], 'base64'))
              }
            }
          } catch {
            // reading file is needed for inlining CSS, but failing to do so is
            // not causing fatal error so we just ignore it here
          }
          
          return originalReadFile.apply(globalThis.Deno, args)
        }
      } catch {
        // reading file is needed for inlining CSS, but failing to do so is
        // not causing fatal error so we just ignore it here
      }
    }

    export default async (request, context) => {
      const commonEngineRenderArgs = {
        bootstrap: bootstrap,
        document,
        url: request.url,
        publicPath: browserDistFolder,
        platformProviders: [{ provide: "netlify.request", useValue: request }, { provide: "netlify.context", useValue: context }],
      }
      return await Handler(request, context, commonEngineRenderArgs);
    }
    `
  }

  if (!ssrFunctionContent) {
    return failBuild('no ssr function body')
  }

  // eslint-disable-next-line no-inline-comments
  const ssrFunction = /* javascript */ `
  import "./polyfill.mjs";
  ${ssrFunctionContent}
  export const config = {
    path: "/*",
    excludedPath: ${JSON.stringify(excludedPaths)},
    generator: "${packageJson.name}@${packageJson.version}",
    name: "Angular SSR",
  };
  `

  await writeFile(join(edgeFunctionDir, 'polyfill.mjs'), polyfills)
  await writeFile(join(edgeFunctionDir, 'fixup-event.mjs'), fixupEvent)
  await writeFile(join(edgeFunctionDir, 'angular-ssr.mjs'), ssrFunction)
}

module.exports.setUpEdgeFunction = setUpEdgeFunction
/* eslint-enable max-lines */
