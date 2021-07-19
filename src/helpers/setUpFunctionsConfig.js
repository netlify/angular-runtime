// Modify [functions] of netlify config
const setUpFunctionsConfig = function ({ netlifyConfig }) {
  // netlifyConfig.functions.node_bundler = 'esbuild'
  // const includedDist = 'dist/netlify-serverless'
  // if (Array.isArray(netlifyConfig.functions.included_files)) {
  //   netlifyConfig.functions.included_files.push(includedDist)
  // } else {
  //   netlifyConfig.functions.included_files = [includedDist]
  // }
}

module.exports = setUpFunctionsConfig
