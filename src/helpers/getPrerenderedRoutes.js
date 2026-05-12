import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

/**
 * @param {string} outputDir
 * @returns {Promise<Record<string, { headers?: Record<string, string> }>>}
 */
export default async function getPrerenderedRoutes(outputDir) {
  const file = join(outputDir, 'prerendered-routes.json')
  if (!existsSync(file)) return {}
  const contents = await readFile(file)
  const { routes: prerenderedRoutes } = JSON.parse(contents)

  if (Array.isArray(prerenderedRoutes)) {
    // Before Angular@19 prerendered-routes is an array of strings
    return prerenderedRoutes.reduce((acc, route) => {
      acc[route] = {}
      return acc
    }, {})
  }

  return prerenderedRoutes
}
