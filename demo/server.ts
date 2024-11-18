import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/context'

const angularAppEngine = new AngularAppEngine()

export const netlifyAppEngineHandler = async (request: Request): Promise<Response> => {
  const context = getContext()

  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
