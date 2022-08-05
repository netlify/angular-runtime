// Modify [functions] of netlify config
const setUpFunctionsConfig = function ({ project, netlifyConfig, PUBLISH_DIR }) {
  netlifyConfig.functions.node_bundler = 'esbuild'

  const includeStyles = project.architect.build.options.styles.map((s) => `${PUBLISH_DIR}/${s.replace('src/', '')}`)

  const includedDist = [`${PUBLISH_DIR}/index.html`, `${PUBLISH_DIR}/styles.css`, ...includeStyles]
  if (Array.isArray(netlifyConfig.functions.included_files)) {
    netlifyConfig.functions.included_files.push(...includedDist)
  } else {
    netlifyConfig.functions.included_files = includedDist
  }
}

module.exports = setUpFunctionsConfig
