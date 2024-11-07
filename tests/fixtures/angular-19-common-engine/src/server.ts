import { CommonEngine } from '@angular/ssr/node'

const commonEngine = new CommonEngine()

export default async function HttpHandler(
  request: Request,
  context: any,
  commonEngineRenderArgs: any,
): Promise<Response> {
  // customize if you want to

  return new Response(
    await commonEngine.render(commonEngineRenderArgs),
    {
      headers: { 'content-type': 'text/html' }
    }
  )
}
