const { join } = require('node:path')

const { existsSync, readJsonSync } = require('fs-extra')

// Get contents of project's angular.json file
const getAngularJson = function ({ failPlugin, siteRoot }) {
  if (!existsSync(join(siteRoot, 'angular.json'))) {
    return failPlugin(`No angular.json found at project root`)
  }
  try {
    return readJsonSync(join(siteRoot, 'angular.json'))
  } catch {
    return failPlugin(`Could not parse contents of angular.json`)
  }
}

module.exports = getAngularJson
