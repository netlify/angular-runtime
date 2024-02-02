import assert from 'node:assert'
import { join as posixJoin } from 'node:path/posix'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import build from '@netlify/build'

test('project without angular config file fails the plugin execution but does not error', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('./fixtures/non-angular-project', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('project with missing angular dependencies does not error', async () => {
  const { severityCode, success } = await build({
    repositoryRoot: fileURLToPath(new URL('./fixtures/missing-angular-deps', import.meta.url)),
  })

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('application builder uses /browser publish dir', async () => {
  const { severityCode, success, logs } = await build({
    repositoryRoot: fileURLToPath(new URL('./fixtures/application-builder', import.meta.url)),
    buffer: true,
  })

  assert(
    logs.stderr.includes(
      `Publish directory is configured incorrectly. Updating to "${posixJoin('dist', 'test-browser-dir', 'browser')}".`,
    ),
  )

  assert.deepEqual(severityCode, 0)
  assert.deepEqual(success, true)
})

test('browser builder uses different publish dir', async () => {
  const { severityCode, success, logs } = await build({
    repositoryRoot: fileURLToPath(new URL('./fixtures/browser-builder', import.meta.url)),
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
