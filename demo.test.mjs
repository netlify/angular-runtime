import assert from 'node:assert'
import { test } from 'node:test'

test('edge function config', async () => {
  const { config } = await import('./demo/.netlify/edge-functions/angular-ssr/angular-ssr.mjs')

  assert.deepEqual(config.excludedPath, [
    '/.netlify/*',
    '/favicon.ico',
    '/heroes/index.html',
    '/index.csr.html',
    '/main-OXU4ZHAA.js',
    '/polyfills-FFHMD2TL.js',
    '/styles-5INURTSO.css',
    '/heroes',
  ])
})
