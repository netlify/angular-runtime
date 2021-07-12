import 'zone.js/dist/zone-node'

import { ngExpressEngine } from '@nguniversal/express-engine'
import * as express from 'express'
import { join } from 'path'

import { AppServerModule } from './src/main.server'
import { APP_BASE_HREF } from '@angular/common'
import { existsSync, readdirSync } from 'fs'

export const app = express()
const rootFolder = existsSync(join(process.cwd(), 'dist'))
  ? process.cwd()
  : join(process.cwd(), 'src')
const distFolder = join(rootFolder, 'dist/netlify-serverless/browser')
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
  console.log({ req })
  res.render(
    indexHtml,
    {
      res,
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    },
    (err: Error, html: string) => {
      console.log({ err });
      res
        .status(html ? 200 : 500)
        .send(
          html +
            `<!--${process.cwd()} ${readdirSync(process.cwd())} ${
              existsSync(distFolder)
                ? readdirSync(distFolder)
                : distFolder + `does not exist`
            } -->` ||
            err.message + JSON.stringify(process.env) + ' cwd ' + process.cwd()
        )
    }
  )
})

export * from './src/main.server'