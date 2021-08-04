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
  /// <reference types="zone.js" />
  import 'zone.js/dist/zone-node'

  import { join } from 'path'
  import { existsSync } from 'fs'

  import { CommonEngine, RenderOptions } from '@nguniversal/common/engine';
  import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
  import MockExpressRequest from 'mock-express-request';
  import MockExpressResponse from 'mock-express-response';
  import qs from 'qs';

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

  // backwards compat for old CLI releases
  function getRawQuery(event): string {
    if (event.rawQuery) {
      return event.rawQuery;
    }

    return qs.stringify(event.multiValueQueryStringParameters, { arrayFormat: 'repeat' })
  }
  function getRawUrl(event): string {
    if (event.rawUrl) {
      return event.rawUrl;
    }

    let query = getRawQuery(event);
    if (!!query) {
      query = '?' + query;
    }
    return (event.headers['x-forwarded-proto'] || 'http') + "://" + event.headers.host + event.path + query;
  }

  export async function render(event, context): Promise<RenderResponse> {
    const { method, path, headers, multiValueHeaders } = event;
    let query = getRawQuery(event);
    if (!!query) {
      query = '?' + query;
    }
    const url = getRawUrl(event);

    const request = new MockExpressRequest({
      method,
      url: path + query,
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
      Zone.current
        .fork({
          name: 'ServerlessErrorHandlerZone',
          onHandleError: (parentZoneDelegate, currentZone, targetZone, error) => {
            reject(error)
            return true; // needed for typescript, no idea what it does
          },
        })
        .runGuarded<Promise<string>>(function () {
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
