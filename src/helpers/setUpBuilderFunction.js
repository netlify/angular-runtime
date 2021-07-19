const { existsSync } = require('fs')
const { join } = require('path')

const { copySync, removeSync } = require('fs-extra')

const setUpBuilderFunction = ({ FUNCTIONS_SRC }) => {
  const TEMPLATES_DIR = join('..', 'src', 'templates')
  const FUNCTIONS_DEST = join(FUNCTIONS_SRC, 'angular-builder.js')
  if (existsSync(FUNCTIONS_DEST)) {
    removeSync(FUNCTIONS_DEST)
  }
  copySync(join(TEMPLATES_DIR, 'angularBuilder.js'), join(FUNCTIONS_SRC, 'angular-builder.js'), {
    overwrite: false,
    dereference: true,
  })
}

module.exports = setUpBuilderFunction
