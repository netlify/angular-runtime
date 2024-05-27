import assert from 'node:assert'
import { test } from 'node:test'

test('edge function config', async () => {
  const { config } = await import('./demo/.netlify/edge-functions/angular-ssr/angular-ssr.mjs')

  assert.deepEqual(config.excludedPath, [
    '/.netlify/*',
    '/dashboard/index.html',
    '/favicon.ico',
    '/heroes/index.html',
    '/index.csr.html',
    '/main-3US5B27T.js',
    '/polyfills-RX4V3J3S.js',
    '/styles-5INURTSO.css',
    '/dashboard',
    '/heroes',
  ])
})
