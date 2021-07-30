const path = require('path')

const { copySync, writeFileSync } = require('fs-extra')

const { getServerlessTs } = require('./getDynamicTemplates')

const addAngularServerlessFiles = ({ projectName, siteRoot }) => {
  const TEMPLATES_DIR = path.join('src', 'templates')

  // Write file with injected project name
  writeFileSync(
    path.join(siteRoot, 'serverless.ts'),
    getServerlessTs({ projectName, siteRoot: path.relative(process.cwd(), siteRoot) }),
  )

  // We can copy this file over without writing because it's not dependent on projectName
  copySync(path.join(TEMPLATES_DIR, 'tsconfig.serverless.json'), path.join(siteRoot, 'tsconfig.serverless.json'), {
    overwrite: true,
  })
}

module.exports = addAngularServerlessFiles
