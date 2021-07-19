// This copies the dist/{projectName} to dist/netlify-serverless to ease file
// accessing from plugin-generated files via templates
const { join } = require('path')

const { copySync, emptyDirSync, existsSync } = require('fs-extra')

const copyProjectDist = ({ projectName }) => {
  const projectDist = join('.', `dist/${projectName}`)
  const netlifyServerlessDist = join('.', 'dist/netlify-serverless')
  if (existsSync(netlifyServerlessDist)) {
    emptyDirSync(netlifyServerlessDist)
  }
  copySync(projectDist, netlifyServerlessDist, {
    overwrite: false,
    errorOnExist: true,
  })
}

module.exports = copyProjectDist
