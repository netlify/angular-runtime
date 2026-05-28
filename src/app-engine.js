import { env } from 'node:process'

/**
 * Generate `allowedHosts` config for `AngularAppEngine` from `@angular/ssr`
 * @returns {string[]}
 */
export function getAllowedHosts() {
  const defaultAllowedHosts = []

  if (env.NETLIFY_LOCAL === 'true') {
    return defaultAllowedHosts
  }

  let deployId
  let deployPrimeUrlHostname
  let siteId
  let siteName

  const environmentVariables = ['DEPLOY_ID', 'DEPLOY_PRIME_URL', 'DEPLOY_URL', 'SITE_ID', 'SITE_NAME', 'URL']

  for (const environmentVariable of environmentVariables) {
    switch (environmentVariable) {
      case 'DEPLOY_ID':
        // not setting this directly above so that validation
        // and warnings remain centralized in the helper
        deployId = getEnvironmentVariable(environmentVariable)
        break
      case 'DEPLOY_PRIME_URL':
        // DEPLOY_PRIME_URL:
        // <branch-name>--<subdomain>.netlify.app or
        // <dp-#>--<subdomain>.netlify.app (supports ADS)
        deployPrimeUrlHostname = getHostnameFromEnvironmentVariable(environmentVariable)
        if (deployPrimeUrlHostname) {
          defaultAllowedHosts.push(deployPrimeUrlHostname)
        }
        break
      case 'DEPLOY_URL':
      case 'URL': {
        // DEPLOY_URL: <deploy-id>--<subdomain>.netlify.app
        // URL: <subdomain>.netlify.app OR <custom-domain>
        // www handling is not required as Netlify auto-redirects
        const hostname = getHostnameFromEnvironmentVariable(environmentVariable)
        if (hostname) {
          defaultAllowedHosts.push(hostname)
        }
        break
      }
      case 'SITE_ID':
        // SITE_ID: <site_id>
        // this makes it <site_id>.netlify.app
        // separate handling because we need it later
        siteId = getEnvironmentVariable(environmentVariable)
        if (siteId) {
          defaultAllowedHosts.push(`${siteId}.netlify.app`)
        }
        break
      case 'SITE_NAME':
        // SITE_NAME: <subdomain>
        // this makes it <subdomain>.netlify.app
        // this may duplicate URL for sites without a custom domain
        // but duplicates are removed later and this is still useful
        // if a custom domain is removed after deployment
        siteName = getEnvironmentVariable(environmentVariable)
        if (siteName) {
          defaultAllowedHosts.push(`${siteName}.netlify.app`)
        }
        break
      default:
        break
    }
  }

  // extract the branch name or deploy preview number
  // so we can generate ADS-compatible URLs
  if (deployPrimeUrlHostname?.includes('--') && siteId && siteName) {
    const [branchNameOrDpNumber] = deployPrimeUrlHostname.split('--')
    defaultAllowedHosts.push(`${branchNameOrDpNumber}--${siteName}.netlify.app`)
    defaultAllowedHosts.push(`${branchNameOrDpNumber}--${siteId}.netlify.app`)
  }

  if (deployId && siteId) {
    // <deploy-id>--<site-id>.netlify.app
    defaultAllowedHosts.push(`${deployId}--${siteId}.netlify.app`)
  }

  return [...new Set(defaultAllowedHosts)]
}

/**
 * Return Netlify-specific context
 * @returns {import('@netlify/edge-functions').Context | undefined}
 */
export function getContext() {
  // eslint-disable-next-line no-undef
  return typeof Netlify !== 'undefined' ? Netlify?.context : undefined
}

/**
 * Return the value of an environment variable
 * @param {string} environmentVariable
 *
 * @returns {string | undefined}
 */
function getEnvironmentVariable(environmentVariable) {
  const value = env[environmentVariable]

  // we inject the literal string "undefined" for variables that don't have a value
  if (value == null || value === '' || value === 'undefined') {
    console.warn(
      `Missing Netlify-specific environment variable ${environmentVariable}. ` +
        '`allowedHosts` config might be incomplete.',
    )

    return
  }

  return value
}

/**
 * Return hostname from the value of an environment variable
 * @param {string} environmentVariable
 *
 * @returns {string | undefined}
 */
function getHostnameFromEnvironmentVariable(environmentVariable) {
  const value = getEnvironmentVariable(environmentVariable)

  if (value == null) {
    return
  }

  try {
    return new URL(value).hostname
  } catch {
    console.warn(`Netlify-specific environment variable ${environmentVariable} does not contain a valid URL`)
  }
}

/**
 * Generate `trustProxyHeaders` config for `AngularAppEngine` from `@angular/ssr`
 * @returns {string[]}
 */
export function getTrustProxyHeaders() {
  return ['x-forwarded-for']
}
