// Add catch-all redirect to builder function
const setUpRedirects = function ({ netlifyConfig }) {
  if (!Array.isArray(netlifyConfig.redirects)) {
    netlifyConfig.redirects = []
  }
  // This redirect *must* come AFTER any additional redirects for the site
  netlifyConfig.redirects.push({
    from: '/*',
    to: '/.netlify/functions/angular-builder',
    status: 200,
  })
  // This redirect is here to handle the "index" default redirection
  netlifyConfig.redirects.push({
    from: '/',
    to: '/.netlify/functions/angular-builder',
    force: true,
    status: 200,
  })
}

module.exports = setUpRedirects
