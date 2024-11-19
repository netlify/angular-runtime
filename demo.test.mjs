import assert from 'node:assert'
import { test } from 'node:test'

test('edge function config', async () => {
  const { config } = await import('./demo/.netlify/edge-functions/angular-ssr/angular-ssr.mjs')

  const excludedPathsWithMaskedHashes = config.excludedPath.map((path) => path.replace(/-[A-Z\d]{8}\./, '-HASHHASH.'))

  assert.deepEqual(excludedPathsWithMaskedHashes, [
    '/.netlify/*',
    '/favicon.ico',
    '/heroes/index.html',
    '/index.csr.html',
    '/main-HASHHASH.js',
    '/polyfills-HASHHASH.js',
    '/styles-HASHHASH.css',
    '/heroes',
  ])
})
