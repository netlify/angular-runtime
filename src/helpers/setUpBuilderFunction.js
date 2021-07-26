const { join } = require('path')

const { writeFileSync, ensureDirSync, existsSync } = require('fs-extra')

const { getAngularBuilder } = require('./getDynamicTemplates')

const setUpBuilderFunction = ({ FUNCTIONS_SRC, projectName }) => {
  const FUNCTION_DEST = join(FUNCTIONS_SRC, 'angular-builder.js')

  ensureDirSync(FUNCTIONS_SRC)
  writeFileSync(FUNCTION_DEST, getAngularBuilder(projectName))
}

module.exports = setUpBuilderFunction
