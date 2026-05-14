import { env } from 'node:process'

export function getAllowedHosts() {
  const allowedHosts = []

  if (!env.DEPLOY_ID || !env.DEPLOY_PRIME_URL || !env.DEPLOY_URL || !env.SITE_ID || !env.SITE_NAME || !env.URL) {
    console.warn('Missing Netlify-specific environment variable(s). `allowedHosts` config might be incomplete.')
    return allowedHosts
  }

  const deployPrimeUrlHostname = new URL(env.DEPLOY_PRIME_URL).hostname

  // <subdomain>.netlify.app OR <custom-domain>
  // www handling is not required as Netlify will auto-redirect
  allowedHosts.push(new URL(env.URL).hostname)
  // <deploy-id>--<subdomain>.netlify.app
  allowedHosts.push(new URL(env.DEPLOY_URL).hostname)
  // <branch-name>--<subdomain>.netlify.app or <dp-#>--<subdomain>.netlify.app (supports ADS)
  allowedHosts.push(deployPrimeUrlHostname)
  // <subdomain>.netlify.app
  // this will be duplicated for sites without custom domain
  // but it's important to have in case a site's custom domain is removed after a deploy
  allowedHosts.push(`${env.SITE_NAME}.netlify.app`)
  // <site-id>.netlify.app
  allowedHosts.push(`${env.SITE_ID}.netlify.app`)
  // <deploy-id>--<site-id>.netlify.app
  allowedHosts.push(`${env.DEPLOY_ID}--${env.SITE_ID}.netlify.app`)

  // we need to extract the branch name or the deploy preview number
  // so we can add the subdomain as well as site-id specific URLs
  // this would be required for sites using ADS so that
  // we can add netlify.app URLs as well
  if (deployPrimeUrlHostname.includes('--')) {
    const [branchNameOrDpNumber] = deployPrimeUrlHostname.split('--')
    allowedHosts.push(`${branchNameOrDpNumber}--${env.SITE_NAME}.netlify.app`)
    allowedHosts.push(`${branchNameOrDpNumber}--${env.SITE_ID}.netlify.app`)
  }

  return allowedHosts
}

export function getTrustProxyHeaders() {
  return ['x-forwarded-for']
}
