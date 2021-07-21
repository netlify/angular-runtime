const { join } = require('path')

const { copySync } = require('fs-extra')

const setUpBuilderFunction = ({ FUNCTIONS_SRC }) => {
  const TEMPLATES_DIR = join('..', 'src', 'templates')
  const FUNCTIONS_DEST = join(FUNCTIONS_SRC, 'angular-builder.js')

  copySync(join(TEMPLATES_DIR, 'angularBuilder.js'), join(FUNCTIONS_SRC, 'angular-builder.js'), {
    overwrite: true,
    dereference: true,
  })
}

module.exports = setUpBuilderFunction
