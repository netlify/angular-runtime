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
- [Customizing request handling](#customizing-request-handling)
  - [Limitations](#limitations)
- [CLI Usage](#cli-usage)
- [Getting Help](#getting-help)
- [Contributing](#contributing)
- [License](#license)

## Installation and Configuration

Netlify automatically detects Angular projects and sets up the latest version of this plugin. There's no further configuration needed from Netlify users.

### Manual Installation

If you need to pin down this plugin to a fixed version, install it manually.

Create a `netlify.toml` in the root of your project. Your file should include the plugins section below:

```toml
[[plugins]]
  package = "@netlify/angular-runtime"
```

Install it via your package manager:

```bash
npm install -D @netlify/angular-runtime
# or
yarn add -D @netlify/angular-runtime
```

Read more about [file-based plugin installation](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation)
in our docs.

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
### App Engine Developer Preview usage with Angular@19

If you opt into the App Engine Developer Preview accessing `Request` and `Context` objects is streamlined. Instead of custom Netlify prefixed providers, you should use the standardized injection tokens for those provided by `@angular/ssr` instead:

```diff
+import { REQUEST, REQUEST_CONTEXT } from '@angular/ssr/tokens'
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

## Customizing request handling

Starting with Angular@19. The build plugin makes use of `server.ts` file to handle requests. The default Angular scaffolding does generate incompatible code for Netlify so build plugin will swap it for compatible `server.ts` file for you automatically if it detects default one being used. If you need to customize the request handling, you can do so by copying one of code snippets below to your `server.ts` file.

If you did not opt into the App Engine Developer Preview:

```ts
import { CommonEngine } from '@angular/ssr/node'
import { render } from '@netlify/angular-runtime/common-engine'
import type { Context } from "@netlify/edge-functions"

const commonEngine = new CommonEngine()

export default async function HttpHandler(request: Request, context: Context): Promise<Response> {
  // customize if you want to have custom request handling by checking request.url
  // and returning instance of Response

  return await render(commonEngine)
}
```

If you opted into the App Engine Developer Preview:

```ts
import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import type { Context } from "@netlify/edge-functions"

const angularAppEngine = new AngularAppEngine()

export const reqHandler = createRequestHandler(async (request: Request, context: Context) => {
  // customize if you want to have custom request handling by checking request.url
  // and returning instance of Response

  const result = await angularAppEngine.handle(request, context)
  return result || new Response('Not found', { status: 404 })
})
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
