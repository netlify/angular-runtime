import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
export default function getAngularJson({ failPlugin, siteRoot, workspaceType, packagePath }) {
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
      return JSON.parse(readFileSync(join(siteRoot, packagePath, 'project.json'), 'utf-8'))
    } catch {
      return failPlugin(`Could not parse the contents of project.json`)
    }
  }

  if (!existsSync(join(siteRoot, 'angular.json'))) {
    return failPlugin(`No angular.json found at project root`)
  }
  try {
    return JSON.parse(readFileSync(join(siteRoot, 'angular.json'), 'utf-8'))
  } catch {
    return failPlugin(`Could not parse contents of angular.json`)
  }
}
