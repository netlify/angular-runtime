const { existsSync, readFileSync } = require('fs')
const path = require('path')

// Get contents of project's angular.json file
const getAngularJson = function ({ failBuild }) {
  const siteRoot = process.cwd()
  if (!existsSync(path.join(siteRoot, 'angular.json'))) {
    return failBuild(`No angular.json found at project root`)
  }
  try {
    const angularJsonFile = readFileSync(path.join(siteRoot, 'angular.json'), 'utf-8')
    const angularJson = JSON.parse(angularJsonFile)
    return angularJson
  } catch (error) {
    return failBuild(`Could not parse contents of angular.json`)
  }
}

module.exports = getAngularJson
