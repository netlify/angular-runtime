/* eslint-disable max-lines */
const { Buffer } = require('node:buffer')
const { readdirSync, existsSync } = require('node:fs')
const { writeFile, mkdir, readFile } = require('node:fs/promises')
const { join, relative, sep, posix } = require('node:path')
const process = require('node:process')

const packageJson = require('../../package.json')

const getPrerenderedRoutes = require('./getPrerenderedRoutes')

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

const getProjectName = (angularJson, failBuild) => {
  const selectedProject = process.env.ANGULAR_PROJECT

  if (selectedProject) {
    const project = angularJson.projects[selectedProject]
    if (!project) {
      return failBuild(
        `Could not find project selected project "${selectedProject}" in angular.json. Please update the ANGULAR_PROJECT environment variable.`,
      )
    }
    return selectedProject
  }

  const projectNames = Object.keys(angularJson.projects)
  const [projectName] = projectNames
  if (projectNames.length > 1) {
    console.warn(
      `Found multiple projects in angular.json, deploying "${projectName}". To deploy a different one, set the ANGULAR_PROJECT environment variable to the project name.`,
    )
  }

  return projectName
}

const getProject = (angularJson, failBuild, isNxWorkspace = false, projectName = null) => {
  if (isNxWorkspace) {
    return angularJson
  }
  if (!projectName) {
    projectName = getProjectName(angularJson, failBuild)
  }

  return angularJson.projects[projectName]
}

module.exports.getProject = getProject

const getBuildInformation = (angularJson, failBuild, workspaceType) => {
  const projectName = workspaceType === 'nx' ? '' : getProjectName(angularJson, failBuild)
  const project = getProject(angularJson, failBuild, workspaceType === 'nx', projectName)

  let { outputPath } = workspaceType === 'nx' ? project.targets.build.options : project.architect.build.options

  if (!outputPath && workspaceType === 'default') {
    // outputPath might not be explicitly defined in angular.json
    // so we will try default which is dist/<project-name>
    outputPath = join('dist', projectName)
  }

  const isApplicationBuilder =
    workspaceType === 'nx'
      ? project.targets.build.executor.endsWith(':application')
      : project.architect.build.builder.endsWith(':application')

  return { outputPath, isApplicationBuilder }
}

module.exports.getBuildInformation = getBuildInformation

// eslint-disable-next-line max-lines-per-function
const setUpEdgeFunction = async ({ outputPath, constants, failBuild, usedEngine }) => {
  const serverDistRoot = join(outputPath, 'server')
  if (!existsSync(serverDistRoot)) {
    console.log('No server output generated, skipping SSR setup.')
    return
  }

  console.log(`Writing Angular SSR Edge Function ...`)

  const edgeFunctionDir = join(constants.INTERNAL_EDGE_FUNCTIONS_SRC, 'angular-ssr')
  await mkdir(edgeFunctionDir, { recursive: true })

  const html = await readFile(join(serverDistRoot, 'index.server.html'), 'utf-8')
  const staticFiles = getAllFilesIn(join(outputPath, 'browser')).map(
    (path) => `/${relative(join(outputPath, 'browser'), path)}`,
  )

  const excludedPaths = ['/.netlify/*', ...staticFiles, ...Object.keys(await getPrerenderedRoutes(outputPath))].map(
    toPosix,
  )

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
    const outputBrowserDir = join(outputPath, 'browser')
    const cssFiles = getAllFilesIn(outputBrowserDir).filter((file) => file.endsWith('.css'))

    for (const cssFile of cssFiles) {
      const content = await readFile(cssFile)
      cssAssetsManifest[`${relative(outputBrowserDir, cssFile)}`] = content.toString('base64')
    }

    // eslint-disable-next-line no-inline-comments
    ssrFunctionContent = /* javascript */ `
    import { AsyncLocalStorage } from "node:async_hooks";
    import { Buffer } from "node:buffer";
    import { dirname, relative, resolve } from 'node:path';
    import { fileURLToPath } from 'node:url';

    import { netlifyCommonEngineHandler } from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/server.mjs";
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

    const commonEngineArgsAsyncLocalStorage = new AsyncLocalStorage();

    // Not ideal to set global, but server.ts in userland is being compiled and bundled by Angular
    // and this file will be bundle by Netlify edge bundler so we have to avoid relying on "same"
    // imports in both so setting this ~factory on global is used as workaround
    globalThis.CommonEngineArgsFactory = {
      get() {
        return commonEngineArgsAsyncLocalStorage.getStore();
      }
    }

    export default async (request, context) => {
      const commonEngineRenderArgs = {
        bootstrap: bootstrap,
        document,
        url: request.url,
        publicPath: browserDistFolder,
        providers: [{ provide: "netlify.request", useValue: request }, { provide: "netlify.context", useValue: context }],
      }

      return commonEngineArgsAsyncLocalStorage.run(commonEngineRenderArgs, async () => {
        return await netlifyCommonEngineHandler(request, context);
      })
    }
    `
  } else if (usedEngine === 'AppEngine') {
    // eslint-disable-next-line no-inline-comments
    ssrFunctionContent = /* javascript */ `
    import { netlifyAppEngineHandler } from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/server.mjs";
    import "./fixup-event.mjs";

    export default netlifyAppEngineHandler;
    `
  }

  if (!ssrFunctionContent) {
    return failBuild(`"${usedEngine}" is currently not a supported.`)
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
