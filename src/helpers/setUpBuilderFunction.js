const { join } = require('path')

const { copySync } = require('fs-extra')

const setUpBuilderFunction = ({ FUNCTIONS_SRC }) => {
  const TEMPLATES_DIR = join(__dirname, 'templates')
  copySync(join(TEMPLATES_DIR, 'angularBuilder.js'), join(FUNCTIONS_SRC, './angular-builder.js'), {
    overwrite: false,
    errorOnExist: true,
  })
}

module.exports = setUpBuilderFunction
