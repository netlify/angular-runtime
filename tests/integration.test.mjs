import assert from 'node:assert'
import { join } from 'node:path'
import { join as posixJoin } from 'node:path/posix'
import { test, describe } from 'node:test'
import { fileURLToPath } from 'node:url'

import build from '@netlify/build'

import { getAngularVersion } from '../src/helpers/getPackageVersion.js'
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

test('Angular 19 using CommonEngine', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/angular-19-common-engine', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('Angular 19 using App Engine (Developer Preview)', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/angular-19-app-engine', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('Angular 19 in an NX workspace using CommonEngine', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/nx-angular-19-common-engine', import.meta.url)),
    packagePath: 'apps/nx-angular-19-common-engine',
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('Angular 19 in an NX workspace using App Engine (Developer Preview)', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('fixtures/nx-angular-19-app-engine', import.meta.url)),
    packagePath: 'apps/nx-angular-19-app-engine',
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

describe('Angular version validation', () => {
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
