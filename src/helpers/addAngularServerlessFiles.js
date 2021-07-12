const { join } = require('path')

const { copySync } = require('fs-extra')

const addAngularServerlessFiles = () => {
  const TEMPLATES_DIR = join(__dirname, 'templates')
  copySync(join(TEMPLATES_DIR, 'serverless.ts'), './serverless.ts', {
    overwrite: false,
    errorOnExist: true,
  })
  copySync(join(TEMPLATES_DIR, 'tsconfig.serverless.json'), './tsconfig.serverless.json', {
    overwrite: false,
    errorOnExist: true,
  })
}

module.exports = addAngularServerlessFiles
