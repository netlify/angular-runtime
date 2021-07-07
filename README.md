![Netlify Build plugin Angular Serverless – Run Angular Universal seamlessly on Netlify](netlify-plugin-angular.png)

# Essential Angular Serverless Plugin

This build plugin is a utility for supporting Angular Universal on Netlify. This plugin will be installed by running a Netlify-specific Angular schematic, but it can also be installed manually.

## Table of Contents

- [Installation and Configuration](#installation-and-configuration)

## Installation and Configuration

### Angular Schematic
- TBD

### Manual Installation

1. Create a `netlify.toml` in the root of your project. Your file should include
   the plugins section below:

```toml
TBD
```

2. From your project's base directory, add this plugin to `dependencies` in
   `package.json`.

```bash
# yarn add --save @netlify/plugin-angular-serverless
npm install --save @netlify/plugin-angular-serverless
```

Read more about
[file-based plugin installation](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation)
in our docs.
