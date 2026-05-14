import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getAllowedHosts, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine-config.js'
import { getContext } from '@netlify/angular-runtime/context.js'

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
})

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext()

  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
