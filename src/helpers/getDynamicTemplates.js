const getAngularBuilder = ({ functionServerPath }) => `
  const { builder } = require('@netlify/functions')
  const awsServerlessExpress = require('aws-serverless-express')
  const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

  // eslint-disable-next-line node/no-missing-require, node/no-unpublished-require

  const server = require('${functionServerPath}')

  // makes event and context available to app
  server.app.use(awsServerlessExpressMiddleware.eventContext())

  const serverProxy = awsServerlessExpress.createServer(server.app)

  const handler = (event, context) => awsServerlessExpress.proxy(serverProxy, event, context, 'PROMISE').promise

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
  const rootFolder = existsSync(join('${siteRoot}', 'dist'))
  ? '${siteRoot}'
  : join('${siteRoot}', 'src')
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
