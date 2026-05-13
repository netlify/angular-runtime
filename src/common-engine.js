export async function render(commonEngine) {
  const commonEngineRenderArgs = globalThis.CommonEngineArgsFactory.get()
  return new Response(await commonEngine.render(commonEngineRenderArgs), {
    headers: { 'content-type': 'text/html' },
  })
}
