const getAngularBuilder = ({ functionServerPath }) => `
  const { builder } = require('@netlify/functions')
  const serverlessExpress = require('@vendia/serverless-express')

  const server = require('${functionServerPath}')

  const handler = async (event, context) => {
    try {
      const serverlessHandler = await serverlessExpress({ app: server.app, eventSourceName: 'AWS_API_GATEWAY_V1' })
      const response = await serverlessHandler(event, context)
      return response
    } catch (e) {
      return {
        statusCode: 404
      }
    }
  }

  exports.handler = builder(handler)
`

const getServerlessTs = ({ projectName, siteRoot }) => `
  import 'zone.js/dist/zone-node'

  import { ngExpressEngine } from '@nguniversal/express-engine'
  import * as express from 'express'
  import { join } from 'path'

  import { AppServerModule } from './src/main.server'
  import { APP_BASE_HREF } from '@angular/common'
  import { existsSync, readdirSync } from 'fs'

  export const app = express()
  const rootFolder = '${siteRoot}'
  if (!existsSync(join(rootFolder, 'dist'))) {
    throw new Error('Page not found')
  }
  const distFolder = join(rootFolder, 'dist/${projectName}/browser')
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
  ? 'index.original.html'
  : 'index'

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  app.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  )

  app.set('view engine', 'html')
  app.set('views', distFolder)

  // All regular routes use the Universal engine
  app.get('*', (req, res) => {
    res.render(
      indexHtml,
      {
        res,
        req,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
      }
    )
  })

  export * from './src/main.server'
`

module.exports = {
  getAngularBuilder,
  getServerlessTs,
}
