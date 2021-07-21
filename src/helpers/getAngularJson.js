const { join } = require('path')

const { existsSync, readJsonSync } = require('fs-extra')

// Get contents of project's angular.json file
const getAngularJson = function ({ failBuild, siteRoot }) {
  if (!existsSync(join(siteRoot, 'angular.json'))) {
    return failBuild(`No angular.json found at project root`)
  }
  try {
    return readJsonSync(join(siteRoot, 'angular.json'))
  } catch (error) {
    return failBuild(`Could not parse contents of angular.json`)
  }
}

module.exports = getAngularJson
