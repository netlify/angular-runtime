const outdent = require('outdent')
// this is here so this works: https://marketplace.visualstudio.com/items?itemName=zjcompt.es6-string-javascript
const javascript = outdent

const getAngularBuilder = ({ functionServerPath }) => javascript`
  const { builder } = require('@netlify/functions')

  const { render } = require('${functionServerPath}')

  const handler = async (event, context) => {
    try {
      const { html, headers, status } = await render(event, context)
      return {
        statusCode: status,
        body: html,
        multiValueHeaders: {
          "Content-Type": ["text/html; charset=utf-8"],
          ...headers,
        }
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
  import { existsSync } from 'fs'

  import { APP_BASE_HREF } from '@angular/common' // todo: use this
  import { CommonEngine, RenderOptions } from '@nguniversal/common/engine';
  import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
  import MockExpressRequest from 'mock-express-request';
  import MockExpressResponse from 'mock-express-response';

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

  type Headers = { [k: string]: string[] }
  interface RenderResponse {
    html: string,
    headers: Headers,
    status: number,
  }

  export async function render({ method, path, headers, multiValueHeaders }, context): Promise<RenderResponse> {
    // todo: missing query string params, might want to use event.rawUrl instead
    const url = "https://" + headers.host + path;

    const request = new MockExpressRequest({
      method,
      url: path, // todo: missing query string
      headers: multiValueHeaders,
    })
    const responseBuilder = new MockExpressResponse({ request })
    const renderOptions: RenderOptions = {
      bootstrap: AppServerModule,
      url,
      publicPath: browserFolder,
      documentFilePath: indexHtml, // todo: check if this works with prerendering!
      providers: [
        { provide: REQUEST, useValue: request },
        { provide: RESPONSE, useValue: responseBuilder },
      ],
    }

    const html: string = await new Promise((resolve, reject) => {
      // @ts-ignore
      Zone.current
        .fork({
          name: 'ServerlessErrorHandlerZone',
          onHandleError: (parentZoneDelegate, currentZone, targetZone, error) => {
            reject(error)
          },
        })
        .runGuarded(function () {
          return engine.render(renderOptions)
        })
        .then(resolve)
        .catch(reject)
    })
    return {
      html,
      status: responseBuilder.statusCode,
      headers: responseBuilder.getHeaders(),
    }
  }
`

module.exports = {
  getAngularBuilder,
  getServerlessTs,
}
