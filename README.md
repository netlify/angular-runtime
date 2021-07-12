![Netlify Build plugin Angular Serverless – Run Angular Universal seamlessly on Netlify](netlify-plugin-angular.png)

# Essential Angular Serverless Plugin

This build plugin is a utility for supporting Angular Universal on Netlify. This plugin should be installed by running a Netlify-specific Angular schematic.

## Table of Contents

- [Installation and Configuration](#installation-and-configuration)

## Installation and Configuration

### Angular Schematic

```bash
ng add netlify-schematics
```

```bash
ng generate netlify-schematics:netlify-serverless`
```

The schematic commands will create a `netlify.toml` in the root of your project, if it doesn't already exist. Your file should include the correct build command, publish directory, and plugins section below. Note: the build command requires you to include your custom project name (as indicated in your angular.json) where designated below:

```toml
[build]
  command = "ng build --configuration production && ng run {projectName}:serverless:production"
  publish = "dist/netlify-serverless/browser"

[[plugins]]
  package = "@netlify/plugin-angular-serverless"
```
