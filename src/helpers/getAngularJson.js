const { join } = require('node:path')
const process = require('process')

const { existsSync, readJsonSync } = require('fs-extra')

/**
 * Get contents of project's angular.json file
 * @param {Object} obj
 * @param {string} obj.siteRoot Root directory of an app
 * @param {(msg: string) => never} obj.failPlugin Function to fail the plugin
 * @param {'nx' | 'default'} obj.workspaceType Type of monorepo, dictates what json file to open
 *
 * @returns {any}
 */
const getAngularJson = function ({ failPlugin, siteRoot, workspaceType }) {
  if (workspaceType === 'nx') {
    const selectedProject = process.env.ANGULAR_PROJECT

    if (!selectedProject) {
      return failPlugin(
        `The ANGULAR_PROJECT environment variable is not set. This is needed to determine the project.json to load in an NX workspace`,
      )
    }

    if (!existsSync(join(siteRoot, 'apps', selectedProject, 'project.json'))) {
      return failPlugin(`No project.json found in apps/${selectedProject}`)
    }

    try {
      return readJsonSync(join(siteRoot, 'apps', selectedProject, 'project.json'))
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
