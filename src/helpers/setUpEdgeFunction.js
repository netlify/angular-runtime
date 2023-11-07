const { existsSync, readdirSync } = require('node:fs')
const { writeFile, mkdir, readFile } = require('node:fs/promises')
const { join, relative, sep, posix } = require('node:path')

const { readJson } = require('fs-extra')

/**
 * Recursively lists all files in a directory.
 */
const getAllFilesIn = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    if (dirent.isDirectory()) {
      return getAllFilesIn(join(dir, dirent.name)).map((path) => join(dirent.name, path))
    }
    return [join(dir, dirent.name)]
  })

const toPosix = (path) => path.split(sep).join(posix.sep)

const setUpEdgeFunction = async ({ angularJson, projectName, netlifyConfig, constants, failBuild }) => {
  const project = angularJson.projects[projectName]
  const {
    architect: { build },
  } = project
  const outputDir = build?.options?.outputPath
  if (!outputDir || !existsSync(outputDir)) {
    return failBuild('Could not find build output directory')
  }

  console.log(`Writing Angular SSR Edge Function for project "${projectName}" ...`)

  netlifyConfig.build.publish = join(outputDir, 'browser')

  const edgeFunctionDir = join(constants.INTERNAL_EDGE_FUNCTIONS_SRC, 'angular-ssr')
  await mkdir(edgeFunctionDir, { recursive: true })

  const serverDistRoot = join(outputDir, 'server')
  const html = await readFile(join(serverDistRoot, 'index.server.html'), 'utf-8')
  const staticFiles = getAllFilesIn(join(outputDir, 'browser')).map(
    (path) => `/${relative(join(outputDir, 'browser'), path)}`,
  )

  const { routes: prerenderedRoutes } = await readJson(join(outputDir, 'prerendered-routes.json'))
  const excludedPaths = [...staticFiles, ...prerenderedRoutes]

  // buy putting this into a separate module that's imported first,
  // we ensure this is initialised before any other module
  const polyfills = `
  import process from "node:process"

  globalThis.process = process
  globalThis.global = globalThis
  `

  const ssrFunction = `
  import "./polyfill.mjs";
  import { renderApplication } from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/render-utils.server.mjs";
  import bootstrap from "${toPosix(relative(edgeFunctionDir, serverDistRoot))}/main.server.mjs";
  
  const document = \`${html}\`;
  
  export default async (request, context) => {
    const html = await renderApplication(bootstrap, {
      url: request.url,
      document,
      platformProviders: [{ provide: "netlify.request", useValue: request }, { provide: "netlify.context", useValue: context }],
    });
    return new Response(html, { headers: { "content-type": "text/html" } });
  };
  
  export const config = {
    path: "/*",
    excludedPath: ${JSON.stringify(excludedPaths)},
    generator: "angular-on-netlify",
    name: "Angular SSR",
  };
  `

  await writeFile(join(edgeFunctionDir, 'polyfill.mjs'), polyfills)
  await writeFile(join(edgeFunctionDir, 'angular-ssr.mjs'), ssrFunction)
}

module.exports = setUpEdgeFunction
