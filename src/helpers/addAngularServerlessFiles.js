const { join } = require('path')

const { copySync, existsSync, removeSync, writeFileSync } = require('fs-extra')

const { getServerlessTs } = require('./getDynamicTemplates')

const addAngularServerlessFiles = ({ projectName }) => {
  const TEMPLATES_DIR = join('..', 'src', 'templates')

  // Write file with injected project name
  writeFileSync('./serverless.ts', getServerlessTs(projectName))

  // We can copy this file over without writing because it's not dependent on projectName
  copySync(join(TEMPLATES_DIR, 'tsconfig.serverless.json'), './tsconfig.serverless.json', {
    overwrite: true,
  })
}

module.exports = addAngularServerlessFiles
