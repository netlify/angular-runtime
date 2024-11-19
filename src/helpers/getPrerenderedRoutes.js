const { existsSync } = require('node:fs')
const { join } = require('node:path')

const { readJson } = require('fs-extra')

/**
 * @param {string} outputDir
 * @returns {Promise<Record<string, { headers?: Record<string, string> }>>}
 */
const getPrerenderedRoutes = async (outputDir) => {
  const file = join(outputDir, 'prerendered-routes.json')
  if (!existsSync(file)) return {}
  const { routes: prerenderedRoutes } = await readJson(file)

  if (Array.isArray(prerenderedRoutes)) {
    // Before Angular@19 prerendered-routes is an array of strings
    return prerenderedRoutes.reduce((acc, route) => {
      acc[route] = {}
      return acc
    }, {})
  }

  return prerenderedRoutes
}

module.exports = getPrerenderedRoutes
