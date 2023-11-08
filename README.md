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
  package = "@netlify/plugin-angular-universal"
```

Install it via your package manager:

```bash
npm install -D @netlify/plugin-angular-universal
# or
yarn add -D @netlify/plugin-angular-universal
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
netlify serve --dir dist/<your-project-name>/browser
```

## CLI Usage

### Requirements

To use the Angular Universal plugin while building and deploying with the CLI, you need to have `netlify-cli v17.0.0` installed (or a later version).

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
