import { RenderMode, ServerRoute } from '@angular/ssr'

export const serverRoutes: ServerRoute[] = [
  // redirects don't seem to work with Prerender mode
  // { path: '', renderMode: RenderMode.Prerender },
  // dashboard component demonstrates "netlify.request" and "netlify.context" injection injection
  // which only really work for SSR, so we are forcing SSR mode here
  {
    path: 'dashboard',
    renderMode: RenderMode.Server,
    headers: {
      foo: 'bar',
    },
  },
  { path: 'detail/:id', renderMode: RenderMode.Server },
  {
    path: 'heroes',
    renderMode: RenderMode.Prerender,
    headers: {
      foo: 'baz',
    },
  },
  // fallback
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
]
