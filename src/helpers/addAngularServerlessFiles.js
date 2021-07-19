const { join } = require('path')

const { copySync } = require('fs-extra')

const addAngularServerlessFiles = () => {
  const TEMPLATES_DIR = join('..', 'src', 'templates')

  copySync(join(TEMPLATES_DIR, 'serverless.ts'), './serverless.ts', {
    overwrite: true,
  })
  copySync(join(TEMPLATES_DIR, 'tsconfig.serverless.json'), './tsconfig.serverless.json', {
    overwrite: true,
  })
}

module.exports = addAngularServerlessFiles
