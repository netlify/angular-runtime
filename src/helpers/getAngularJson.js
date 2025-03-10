const { join } = require('node:path')
const process = require('process')

const { existsSync, readJsonSync } = require('fs-extra')

/**
 * Get contents of project's angular.json file
 * @param {Object} obj
 * @param {string} obj.siteRoot Root directory of an app
 * @param {(msg: string) => never} obj.failPlugin Function to fail the plugin
 * @param {'nx' | 'default'} obj.workspaceType Type of monorepo, dictates what json file to open
 * @param {string} obj.packagePath The path to the package directory
 *
 * @returns {any}
 */
const getAngularJson = function ({ failPlugin, siteRoot, workspaceType, packagePath }) {
  if (workspaceType === 'nx') {
    if ((packagePath ?? '').length === 0) {
      return failPlugin(
        `packagePath must be set to the location of the project.json being built when deploying an NX monorepo, e.g. "apps/{project-name}"`,
      )
    }

    if (!existsSync(join(siteRoot, packagePath, 'project.json'))) {
      return failPlugin(`No project.json found in ${packagePath}`)
    }

    try {
      return readJsonSync(join(siteRoot, packagePath, 'project.json'))
    } catch {
      return failPlugin(`Could not parse the contents of project.json`)
    }
  }

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
