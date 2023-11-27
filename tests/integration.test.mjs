import build from '@netlify/build'
import assert from 'node:assert'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

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
