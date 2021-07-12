// Modify [functions] of netlify config
const setUpFunctionsConfig = function ({ netlifyConfig }) {
  // TO-DO: is this supported by new config changes or does this need to be manual
  // if manual maybe it should be done via schematic

  // [functions]
  // included_files=["dist/angular-bfdx/browser/index.html"]
  // node_bundler="esbuild"
}

module.exports = setUpFunctionsConfig
