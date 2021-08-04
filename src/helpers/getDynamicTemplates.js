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
  import { ErrorHandler, NgModule } from '@angular/core'
  import { CommonEngine, RenderOptions as CommonRenderOptions } from '@nguniversal/common/engine';

  import { AppServerModule } from './src/main.server'
  import { AppComponent } from './src/app/app.component'; // todo: we don't really want to do this import

  const errorCallbackProvider = "_error_callback_provider"
  type ErrorCallback = (error: Error) => void

  class ServerlessErrorHandler implements ErrorHandler {
    constructor(private error_callback: ErrorCallback) {}

    handleError(error) {
      this.error_callback(error)
    }
  }
  const errorHandlerFactory = (cb: ErrorCallback) => new ServerlessErrorHandler(cb)

  @NgModule({
    imports: [AppServerModule],
    providers: [{ provide: ErrorHandler, useFactory: errorHandlerFactory, deps: [errorCallbackProvider] }],
    bootstrap: [AppComponent],
  })
  class HandledServerModule {}

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

  const engine = new CommonEngine(HandledServerModule);

  export function render({ path, headers }, context): Promise<string> {
    const url = "https://" + headers.host + path;
    return new Promise((res, rej) => {
      //const errorHandler = new ServerlessErrorHandler(rej);
      engine.render({
        bootstrap: HandledServerModule,
        url,
        publicPath: browserFolder,
        documentFilePath: indexHtml, // does likely not work with prerendering!
        providers: [{ provide: errorCallbackProvider, useValue: rej }]
      }).then(res).catch(rej)
    })
  }
`

module.exports = {
  getAngularBuilder,
  getServerlessTs,
}
