const { join } = require('node:path')

const { existsSync, readJsonSync } = require('fs-extra')

/**
 * Get contents of project's angular.json file
 * @param {Object} obj
 * @param {string} obj.siteRoot Root directory of an app
 * @param {(msg: string) => never} obj.failPlugin Function to fail the plugin
 *
 * @returns {any}
 */
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
