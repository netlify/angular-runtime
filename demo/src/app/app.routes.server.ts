import { RenderMode, ServerRoute } from '@angular/ssr'

export const serverRoutes: ServerRoute[] = [
  // dashboard component demonstrates "netlify.request" and "netlify.context" injection injection
  // which only really work for SSR, so we are forcing SSR mode here
  { path: 'dashboard', renderMode: RenderMode.Server },
  { path: 'detail/:id', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
]
