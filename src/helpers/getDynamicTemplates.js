const { outdent } = require('outdent')
// this is here so this works: https://marketplace.visualstudio.com/items?itemName=zjcompt.es6-string-javascript
const javascript = outdent

const getAngularBuilder = ({ functionServerPath }) => javascript`
  const { builder } = require('@netlify/functions')

  const { render } = require('${functionServerPath}')

  const handler = async (event, context) => {
    try {
      const html = await render(event, context)
      return {
        statusCode: 200,
        body: html,
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: e.toString(),
      }
    }
  }

  exports.handler = builder(handler)
`

const getServerlessTs = ({ projectName, siteRoot }) => javascript`
  import 'zone.js/dist/zone-node'

  import { join } from 'path'
  import { existsSync, readdirSync } from 'fs'

  import { APP_BASE_HREF } from '@angular/common' // todo: use this
  import { CommonEngine, RenderOptions as CommonRenderOptions } from '@nguniversal/common/engine';

  import { AppServerModule } from './src/main.server'

  const rootFolder = '${siteRoot}'
  const distFolder = join(rootFolder, 'dist');
  if (!existsSync(distFolder)) {
    throw new Error('Page not found')
  }
  const browserFolder = join(distFolder, '${projectName}', 'browser')

  const originalIndex = join(browserFolder, 'index.original.html')
  const indexHtml = existsSync(originalIndex)
    ? originalIndex
    : join(browserFolder, 'index.html')

  const engine = new CommonEngine(AppServerModule);

  export function render({ path, headers }, context): Promise<string> {
    const url = "https://" + headers.host + path;
    return new Promise((res, rej) => {
      //const errorHandler = new ServerlessErrorHandler(rej);
      engine.render({
        bootstrap: AppServerModule,
        url,
        publicPath: browserFolder,
        documentFilePath: indexHtml, // does likely not work with prerendering!
      }).then(res).catch(rej)
    })
  }
`

module.exports = {
  getAngularBuilder,
  getServerlessTs,
}
