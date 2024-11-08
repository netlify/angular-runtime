import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine'

const commonEngine = new CommonEngine()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function HttpHandler(request: Request, context: any): Promise<Response> {
  // customize if you want to have custom request handling

  return await render(commonEngine)
}
