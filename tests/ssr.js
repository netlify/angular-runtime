import { env } from 'node:process'

const deployUrl = env.DEPLOY_URL

if (!deployUrl) {
  throw new Error('DEPLOY_URL is not set')
}

const res = await fetch(deployUrl)
const text = await res.text()

if (!text.includes('ng-server-context="ssr"')) {
  throw new Error(`${deployUrl} not using SSR`)
}
