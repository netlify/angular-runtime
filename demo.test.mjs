import assert from 'node:assert'
import { test } from 'node:test'

test('edge function config', async () => {
  const { config } = await import('./demo/.netlify/edge-functions/angular-ssr/angular-ssr.mjs')

  assert.deepEqual(config.excludedPath, [
    '/dashboard/index.html',
    '/favicon.ico',
    '/heroes/index.html',
    '/index.html',
    '/main-UUT7SL5W.js',
    '/polyfills-LZBJRJJE.js',
    '/styles-5INURTSO.css',
    '/dashboard',
    '/heroes',
  ])
})
