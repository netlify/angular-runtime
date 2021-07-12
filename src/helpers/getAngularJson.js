const { existsSync, readFileSync } = require('fs')

// Get contents of project's angular.json file
const getAngularJson = function ({ failBuild }) {
  if (!existsSync('/angular.json')) {
    return failBuild(`No angular.json found at project root`)
  } else {
    try {
      const angularJsonFile = readFileSync('/angular.json', 'utf-8')
      const angularJson = JSON.parse(angularJsonFile)
      return angularJson
    } catch (e) {
      return failBuild(`Could not parse contents of angular.json`)
    }
  }
}

module.exports = getAngularJson
