const path = require('path')

const { writeFileSync, ensureDirSync, existsSync } = require('fs-extra')

const { getAngularBuilder } = require('./getDynamicTemplates')

const setUpBuilderFunction = ({ FUNCTIONS_SRC, publishPath }) => {
  const FUNCTION_DEST = path.join(FUNCTIONS_SRC, 'angular-builder.js')

  const serverlessFilePath = path.join(publishPath, '..', 'serverless', 'main')
  const functionServerPath = path.relative(FUNCTIONS_SRC, serverlessFilePath)

  ensureDirSync(FUNCTIONS_SRC)
  writeFileSync(FUNCTION_DEST, getAngularBuilder({ functionServerPath }))
}

module.exports = setUpBuilderFunction
