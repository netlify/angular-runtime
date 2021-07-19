// Add catch-all redirect to builder function
const setUpRedirects = function ({ netlifyConfig }) {
  // This redirect *must* come AFTER any additional redirects for the site
  if (!Array.isArray(netlifyConfig.redirects)) {
    netlifyConfig.redirects = []
  }
  netlifyConfig.redirects.push({
    from: '/*',
    to: '/.netlify/functions/angular_builder',
    status: '200',
  })
}

module.exports = setUpRedirects
