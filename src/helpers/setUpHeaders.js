import getPrerenderedRoutes from './getPrerenderedRoutes.js'

export async function setUpHeaders({ outputPath, netlifyConfig }) {
  const prerenderRoutes = await getPrerenderedRoutes(outputPath)

  for (const [route, routeConfig] of Object.entries(prerenderRoutes)) {
    if (routeConfig.headers) {
      netlifyConfig.headers = netlifyConfig.headers ?? []
      netlifyConfig.headers.push({
        for: route,
        values: routeConfig.headers,
      })
    }
  }
}
