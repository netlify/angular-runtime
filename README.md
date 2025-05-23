![Netlify Angular Runtime – Run Angular seamlessly on Netlify](netlify-plugin-angular.png)

# Angular Runtime

<p align="center">
  <a aria-label="npm version" href="https://www.npmjs.com/package/@netlify/angular-runtime">
    <img alt="" src="https://img.shields.io/npm/v/@netlify/angular-runtime">
  </a>
  <a aria-label="MIT License" href="https://img.shields.io/npm/l/@netlify/angular-runtime">
    <img alt="" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</p>

This build plugin implements Angular Support on Netlify.

## Table of Contents

- [Installation and Configuration](#installation-and-configuration)
- [Accessing `Request` and `Context` during Server-Side Rendering](#accessing-request-and-context-during-server-side-rendering)
- [Request handling](#request-handling)
  - [Customizing request handling](#customizing-request-handling)
  - [Limitations](#limitations)
- [CLI Usage](#cli-usage)
- [Getting Help](#getting-help)
- [Contributing](#contributing)
- [License](#license)

## Installation and Configuration

Netlify automatically detects Angular projects and sets up the latest version of this plugin.

### For Angular 17 and Angular 18

There's no further configuration needed from Netlify users.

### For Angular 19 and Angular 20

If you are using Server-Side Rendering you will need to install Angular Runtime in your Angular project to be able to import required utilities to successfully deploy request handler to Netlify. See [Manual Installation](#manual-installation) for installations details. See [Request handling](#request-handling) for more information about request handler.

### Manual Installation

If you need to pin this plugin to a specific version or if you are using Server-Side Rendering with Angular 19 or Angular 20, you will need to install the plugin manually.

Install it via your package manager:

```bash
npm install -D @netlify/angular-runtime
# or
yarn add -D @netlify/angular-runtime
```

## Accessing `Request` and `Context` during Server-Side Rendering

During server-side rendering (SSR), you can access the incoming `Request` object and the Netlify-specific `Context` object via providers:

```ts
import type { Context } from "@netlify/edge-functions"

export class FooComponent {

  constructor(
    // ...
    @Inject('netlify.request') @Optional() request?: Request,
    @Inject('netlify.context') @Optional() context?: Context,
  ) {
    console.log(`Rendering Foo for path ${request?.url} from location ${context?.geo?.city}`)
    // ...
  }
  
}
```

Keep in mind that these will not be available on the client-side or during [prerendering](https://angular.dev/guide/prerendering#prerendering-parameterized-routes).

To test this in local development, run your Angular project using `netlify serve`:

```sh
netlify serve
```

### App Engine usage

With App Engine accessing `Request` and `Context` objects is streamlined. Instead of custom Netlify prefixed providers, you should use the standardized injection tokens for those provided by `@angular/core` instead:

```diff
+import { REQUEST, REQUEST_CONTEXT } from '@angular/core'
import type { Context } from "@netlify/edge-functions"

export class FooComponent {

  constructor(
    // ...
-    @Inject('netlify.request') @Optional() request?: Request,
-    @Inject('netlify.context') @Optional() context?: Context,
+    @Inject(REQUEST) @Optional() request?: Request,
+    @Inject(REQUEST_CONTEXT) @Optional() context?: Context,
  ) {
    console.log(`Rendering Foo for path ${request?.url} from location ${context?.geo?.city}`)
    // ...
  }
  
}
```

Note that App Engine in Angular 19 is in Developer Preview and requires explicit opt-in.

## Request handling

Starting with Angular@19. The build plugin makes use of the `server.ts` file to handle requests. The default Angular scaffolding generates incompatible code for Netlify so the build plugin will swap it for compatible `server.ts` file automatically if it detects default version being used. 

Make sure you have `@netlify/angular-runtime` version 2.2.0 or later installed in your project. Netlify compatible `server.ts` file imports utilities from this package and Angular Compiler need to be able to resolve it and it can only do that if it's installed in your project and not when it's auto-installed by Netlify.

### Customizing request handling

If you need to customize the request handling, you can do so by copying one of code snippets below to your `server.ts` file.

If you are using Angular 20 or Angular 19 with App Engine Developer Preview:

```ts
import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/context.mjs'

const angularAppEngine = new AngularAppEngine()

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext()

  // Example API endpoints can be defined here.
  // Uncomment and define endpoints as necessary.
  // const pathname = new URL(request.url).pathname;
  // if (pathname === '/api/hello') {
  //   return Response.json({ message: 'Hello from the API' });
  // }

  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
```

If you are using Angular 19 and did not opt into the App Engine Developer Preview:

```ts
import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine.mjs'

const commonEngine = new CommonEngine()

export async function netlifyCommonEngineHandler(request: Request, context: any): Promise<Response> {
  // Example API endpoints can be defined here.
  // Uncomment and define endpoints as necessary.
  // const pathname = new URL(request.url).pathname;
  // if (pathname === '/api/hello') {
  //   return Response.json({ message: 'Hello from the API' });
  // }

  return await render(commonEngine)
}
```

### Limitations

The [`server.ts` file](https://angular.dev/guide/ssr#configure-server-side-rendering) that's part of the Angular scaffolding is meant for deploying to a VM, and is not compatible with this Netlify build plugin for Angular@17 and Angular@18. If you applied changes to that file, you'll need to replicate them in an Edge Function. See (#135)[https://github.com/netlify/angular-runtime/issues/135] for an example.

## CLI Usage

### Requirements

To use the Angular Runtime while building and deploying with the CLI, you need to have `netlify-cli v17.0.0` installed (or a later version).

Please also make sure to use `ntl deploy --build` (rather than `ntl build && ntl deploy`).

## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the
project, let us know! You can either:

- Open an issue on this repository
- Tweet at us! We're [@Netlify on Twitter](https://twitter.com/Netlify)
- Or, [join the community forums](https://answers.netlify.com)

## Contributing

We welcome contributions ❤️ - see the [CONTRIBUTING.md](CONTRIBUTING.md) file
for details.

## License

This project is licensed under the MIT License - see the
[LICENSE.md](LICENSE.md) file for details
