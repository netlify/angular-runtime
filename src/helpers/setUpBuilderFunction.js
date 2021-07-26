const { join } = require('path')

const { writeFileSync, existsSync } = require('fs-extra')
const makeDir = require('make-dir')

const { getAngularBuilder } = require('./getDynamicTemplates')

const setUpBuilderFunction = async ({ FUNCTIONS_SRC, projectName }) => {
  const FUNCTION_DEST = join(FUNCTIONS_SRC, 'angular-builder.js')

  if (!existsSync(FUNCTIONS_SRC)) {
    await makeDir(FUNCTIONS_SRC)
  }

  writeFileSync(FUNCTION_DEST, getAngularBuilder(projectName))
}

module.exports = setUpBuilderFunction
