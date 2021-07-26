// Modify [functions] of netlify config
const setUpFunctionsConfig = function ({ netlifyConfig, projectName }) {
  netlifyConfig.functions.node_bundler = 'esbuild'
  const includedDist = `dist/${projectName}/browser/index.html`
  if (Array.isArray(netlifyConfig.functions.included_files)) {
    netlifyConfig.functions.included_files.push(includedDist)
  } else {
    netlifyConfig.functions.included_files = [includedDist]
  }
}

module.exports = setUpFunctionsConfig
