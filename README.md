![Netlify Build plugin Angular Serverless – Run Angular Universal seamlessly on Netlify](netlify-plugin-angular.png)

# Angular Universal Plugin

This build plugin is a utility for supporting Angular Universal on Netlify.

## Table of Contents

- [Installation and Configuration](#installation-and-configuration)
- [CLI Usage](#cli-usage)
- [Caveats](#caveats)

## Installation and Configuration

### Manual Installation

Create a `netlify.toml` in the root of your project. Your file should include the plugins section below:

```toml
[build]
  command = "ng build --configuration production && ng run {projectName}:serverless:production"
  publish = "dist/{projectName}/browser"

[[plugins]]
  package = "@netlify/plugin-angular-serverless"
```

If you'd like to install this plugin at a fixed version, install it via your package manager:

```bash
yarn add @netlify/plugin-angular-universal
npm install @netlify/plugin-angular-universal
```

Read more about [file-based plugin installation](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation)
in our docs.

## CLI Usage

### Plugin Side Effects

This plugin will make direct changes to your project source when run via the CLI:

1. It will modify your angular.json to add a `serverless` project configuration.
2. It will add `serverless.ts` and `tsconfig.serverless.json` files.

It is up to you whether to commit these changes to your project. If the plugin makes updates to these files or configurations, it will overwrite what you'd previously committed, and you can commit the new updates. Otherwise, you can stash and ignore them.

### Workflow

If you'd like to build and deploy your project using the
[Netlify CLI](https://docs.netlify.com/cli/get-started/), we recommend this
workflow to manage git tracking plugin-generated files:

1. Make sure all your project's files are committed before running a build with
   the CLI
2. Run any number of builds and deploys freely (i.e. `netlify build`,
   `netlify deploy --build`, `netlify deploy --prod`)
3. Run `git stash --include-unstaged` to easily ignore plugin-generated files

It's important to note that the CLI may mix your project's source code and
plugin-generated files; this is why we recommend committing all project source
files before running CLI builds.

## Caveats

This plugin is currently in beta.

Right now:
- it does not include out of the box monorepo support
- it does not support Angular Universal prerendering