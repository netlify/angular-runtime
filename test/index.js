const cpy = require('cpy')
const { existsSync, readdirSync, readJsonSync, removeSync } = require('fs-extra')
const path = require('path')
const process = require('process')
const { dir: getTmpDir } = require('tmp-promise')
const plugin = require('..')

const utils = {
  build: {
    failBuild(message) {
      throw new Error(message)
    },
  },
}

// Temporary switch cwd
const changeCwd = function (cwd) {
  const originalCwd = process.cwd()
  process.chdir(cwd)
  return () => {
    process.chdir(originalCwd)
  }
}

const SAMPLE_PROJECT_DIR = `${__dirname}/../demo`

const moveAngularSample = async function (dest) {
  await cpy(SAMPLE_PROJECT_DIR, dest)
}

const TEMPLATES_DIR = `${__dirname}/../src/templates`

const movePluginTemplates = async function (dest) {
  await cpy(TEMPLATES_DIR, path.join(dest, 'src/templates'))
}

// In each test, we change cwd to a temporary directory.
// This allows us not to have to mock filesystem operations.
beforeEach(async () => {
  const { path: path_, cleanup } = await getTmpDir({ unsafeCleanup: true })
  const restoreCwd = changeCwd(path_)
  await moveAngularSample(path_)
  await movePluginTemplates(path_)
  Object.assign(this, { cleanup, restoreCwd })
})

afterEach(async () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  // Cleans up the temporary directory from `getTmpDir()` and do not make it
  // the current directory anymore
  this.restoreCwd()
  await this.cleanup()
})

// const DUMMY_PACKAGE_JSON = { name: 'dummy', version: '1.0.0', scripts: { build: 'next build' } }
// const netlifyConfig = { build: { command: 'npm run build' } }

const BUILD_COMMAND = `ng build --configuration production && ng run angular-bfdx:serverless:production`

const netlifyConfig = {
  build: {
    build: BUILD_COMMAND,
    publish: '/dist/angular-bfdx/browser'
  },
  functions: {},
}

const constants = {
  INTERNAL_FUNCTIONS_SRC: '.netlify/functions',
  FUNCTIONS_SRC: 'netlify/functions',
  PUBLISH_DIR: 'dist/angular-bfdx/browser'
}

describe('preBuild()', () => {
  test('fails build if it cannot find angular.json', async () => {
    removeSync(path.join(process.cwd(), 'angular.json'))
    expect(
      plugin.onPreBuild({
        netlifyConfig,
        utils,
      }),
    ).rejects.toThrow(
      `Could not locate your angular.json at your project root or two levels above your publish directory. Make sure your publish directory is set to "{PATH_TO_YOUR_SITE}/dist/{YOUR_PROJECT_NAME}/browser", where {YOUR_PROJECT_NAME} is 'defaultProject' in your angular.json.`
    )
  })

  test('fails build if no build command', async () => {
    netlifyConfig.build.command = ''
    expect(
      plugin.onPreBuild({
        netlifyConfig,
        utils,
      }),
    ).rejects.toThrow(`Missing build command in your netlify.toml or UI configuration. It should be: ${BUILD_COMMAND}`)
    netlifyConfig.build.command = BUILD_COMMAND
  })

  test('updates angular.json', async () => {
    await plugin.onPreBuild({
      netlifyConfig,
      utils,
    })
    const angularJson = readJsonSync(path.join(process.cwd(), 'angular.json'))
    expect(angularJson.projects["angular-bfdx"].architect.serverless).not.toBe(undefined)
  })

  test('adds angular serverless files', async () => {
    await plugin.onPreBuild({
      netlifyConfig,
      utils,
    })
    const angularJson = readJsonSync(path.join(process.cwd(), 'angular.json'))
    expect(existsSync(path.join(process.cwd(), 'serverless.ts'))).toBe(true)
    expect(existsSync(path.join(process.cwd(), 'tsconfig.serverless.json'))).toBe(true)
  })
})

describe('onBuild()', () => {
  test('adds proper redirects via netlifyConfig mutation', async () => {
    await plugin.onBuild({
      utils,
      netlifyConfig,
      constants,
    })
    const redirects = [{
      from: '/*',
      to: '/.netlify/functions/angular-builder',
      status: 200,
    }]
    expect(netlifyConfig.redirects).toEqual(
      expect.arrayContaining(redirects),
    );
  })

  test('adds proper functions config via netlifyConfig mutation', async () => {
    await plugin.onBuild({
      utils,
      netlifyConfig,
      constants,
    })
    expect(netlifyConfig.functions.node_bundler).toEqual('esbuild')
    const includedFiles = ['dist/angular-bfdx/browser/index.html', 'dist/angular-bfdx/browser/styles.css', 'dist/angular-bfdx/browser/mobile.css']
    expect(netlifyConfig.functions.included_files).toEqual(
      expect.arrayContaining(includedFiles)
    )
  })

  test('sets up the builder function', async () => {
    await plugin.onBuild({
      utils,
      netlifyConfig,
      constants,
    })
    expect(existsSync(path.join(process.cwd(), '.netlify/functions', 'angular-builder.js'))).toBe(true)
  })
})
