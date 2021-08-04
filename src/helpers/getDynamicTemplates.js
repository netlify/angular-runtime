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
        // todo: how would people change the status code from inside angular code?
        statusCode: 200,
        body: html,
      };
    } catch (error) {
      // for now all errors bubbling up from angular turn into a 500
      //
      // it would be lovely to match the noMatch error from the
      // angular router here, but it's a generic Error object, not a
      // special class/type.
      // we should recommend people to put a fallback route into their
      // router config, so they can show a proper 404 page.
      return {
        statusCode: 500,
        body: error.toString(),
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

  const errorCallbackProvider = "_serverless_error_callback_provider"
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
    // todo: missing query string params, might want to use event.rawUrl instead
    const url = "https://" + headers.host + path;

    return new Promise((resolve, reject) => {
      engine.render({
        bootstrap: HandledServerModule,
        url,
        publicPath: browserFolder,
        documentFilePath: indexHtml, // todo: check if this works with prerendering!
        providers: [
          { provide: errorCallbackProvider, useValue: reject },
          // todo: inject a bunch more things
        ]
      }).then(resolve).catch(reject)
    })
  }
`

module.exports = {
  getAngularBuilder,
  getServerlessTs,
}
