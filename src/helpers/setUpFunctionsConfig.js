// Modify [functions] of netlify config
const setUpFunctionsConfig = function ({ netlifyConfig, PUBLISH_DIR }) {
  netlifyConfig.functions.node_bundler = 'esbuild'

  const includedDist = [`${PUBLISH_DIR}/index.html`]
  if (Array.isArray(netlifyConfig.functions.included_files)) {
    netlifyConfig.functions.included_files.push(...includedDist)
  } else {
    netlifyConfig.functions.included_files = includedDist
  }
}

module.exports = setUpFunctionsConfig
