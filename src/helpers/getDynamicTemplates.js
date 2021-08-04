const outdent = require('outdent')
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
  import { existsSync } from 'fs'

  import { APP_BASE_HREF } from '@angular/common' // todo: use this
  import { CommonEngine, RenderOptions } from '@nguniversal/common/engine';

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
    // todo: missing query string params, might want to use event.rawUrl instead
    const url = "https://" + headers.host + path;

    const renderOptions: RenderOptions = {
      bootstrap: AppServerModule,
      url,
      publicPath: browserFolder,
      documentFilePath: indexHtml, // todo: check if this works with prerendering!
      providers: [
        // todo: inject a bunch of useful things
      ],
    }

    return new Promise((resolve, reject) => {
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
  }
`

module.exports = {
  getAngularBuilder,
  getServerlessTs,
}
