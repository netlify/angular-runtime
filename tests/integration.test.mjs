/* eslint-disable no-underscore-dangle */
import assert from 'node:assert'
import { Module } from 'node:module'
import { join } from 'node:path'
import { join as posixJoin } from 'node:path/posix'
import { test, describe, before, after } from 'node:test'
import { fileURLToPath } from 'node:url'

import build from '@netlify/build'

import getAngularVersion from '../src/helpers/getAngularVersion.js'
import validateAngularVersion from '../src/helpers/validateAngularVersion.js'

test('project without angular config file fails the plugin execution but does not error', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/non-angular-project', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('project with missing angular dependencies does not error', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/missing-angular-deps', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('application builder uses /browser publish dir', async () => {
  const { severityCode, success, logs } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/application-builder', import.meta.url)),
    buffer: true,
  })

  assert(
    logs.stderr.includes(
      `Publish directory is configured incorrectly. Updating to "${join('dist', 'test-browser-dir', 'browser')}".`,
    ),
  )

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('browser builder uses different publish dir', async () => {
  const { severityCode, success, logs } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/browser-builder', import.meta.url)),
    buffer: true,
  })

  assert(
    logs.stderr.includes(
      `Publish directory is configured incorrectly. Updating to "${posixJoin('dist', 'test-browser-dir')}".`,
    ),
  )

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('doesnt fail if prerender-routes.json file is missing', async () => {
  const { success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/prerender-false', import.meta.url)),
    buffer: true,
  })
  assert.deepEqual(success, true)
})

test('doesnt fail if prerender-routes.json file is missing (Angular 19)', async () => {
  const { success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/angular-19-prerender-false', import.meta.url)),
    buffer: true,
  })
  assert.deepEqual(success, true)
})

// TODO: Make this work
test('Angular 19 using CommonEngine', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/angular-19-common-engine', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

// TODO: Make this work
test('Angular 19 using App Engine (Developer Preview)', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/angular-19-app-engine', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

describe('Angular version validation', () => {
  let originalNodeModulePaths
  before(() => {
    // Node.js automatically add all parent dirs to lookups, so this test will find @angular/core from main project dev dependencies
    // even if test fixture itself doesn't contain it.

    // to workaround this we just allow lookup in test fixture dir inspired by https://stackoverflow.com/questions/32455431/prevent-require-from-looking-up-modules-in-the-parent-directory

    originalNodeModulePaths = Module._nodeModulePaths
    Module._nodeModulePaths = (...args) => originalNodeModulePaths.apply(Module, args).slice(0, 1)
  })

  after(() => {
    Module._nodeModulePaths = originalNodeModulePaths
  })

  test('checks version for angular 19', async () => {
    const result = validateAngularVersion(
      await getAngularVersion(fileURLToPath(new URL('fixtures/angular-19-common-engine', import.meta.url))),
    )
    assert.strictEqual(result, true)
  })

  test('checks version for angular 18', async () => {
    const result = validateAngularVersion(
      await getAngularVersion(fileURLToPath(new URL('fixtures/application-builder', import.meta.url))),
    )
    assert.strictEqual(result, true)
  })

  test('checks version for angular 17', async () => {
    const result = validateAngularVersion(
      await getAngularVersion(fileURLToPath(new URL('fixtures/angular-17', import.meta.url))),
    )
    assert.strictEqual(result, true)
  })

  test('fails angular version validation when angular dependencies are missing', async () => {
    const result = validateAngularVersion(
      await getAngularVersion(fileURLToPath(new URL('fixtures/missing-angular-deps', import.meta.url))),
    )
    assert.strictEqual(result, false)
  })
})
/* eslint-enable no-underscore-dangle */
