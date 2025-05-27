const getPrerenderedRoutes = require('./getPrerenderedRoutes')

const setUpHeaders = async ({ outputPath, netlifyConfig }) => {
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

module.exports = setUpHeaders
