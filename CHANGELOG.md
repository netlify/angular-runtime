# Changelog

## [2.2.2](https://github.com/netlify/angular-runtime/compare/v2.2.1...v2.2.2) (2025-02-06)


### Bug Fixes

* correct checking for runtime version installed in the project and provide example API endpoint in code snippets ([#230](https://github.com/netlify/angular-runtime/issues/230)) ([3c7171f](https://github.com/netlify/angular-runtime/commit/3c7171f537db346e8f95f49a69cc7552e6d24d20))
* provide failBuild to getProject calls ([#247](https://github.com/netlify/angular-runtime/issues/247)) ([9a3b1bd](https://github.com/netlify/angular-runtime/commit/9a3b1bdb7b07001d13a8781b0a3fd85c8651f867))

## [2.2.1](https://github.com/netlify/angular-runtime/compare/v2.2.0...v2.2.1) (2024-11-20)


### Bug Fixes

* add check for existence of runtime package in user project ([#226](https://github.com/netlify/angular-runtime/issues/226)) ([ce7ce06](https://github.com/netlify/angular-runtime/commit/ce7ce0604c9b302c51ce34ae690cf16e28eb9c27))
* add more variants of known/default server.ts ([#229](https://github.com/netlify/angular-runtime/issues/229)) ([8547d35](https://github.com/netlify/angular-runtime/commit/8547d359b3344b530f1ac27547520665ef63429b))
* update readme with installation notes for Angular 19 ([#223](https://github.com/netlify/angular-runtime/issues/223)) ([967bb66](https://github.com/netlify/angular-runtime/commit/967bb66a8190808c97c08c2dbaa702110bc962b5))

## [2.2.0](https://github.com/netlify/angular-runtime/compare/v2.1.1...v2.2.0) (2024-11-19)


### Features

* support [@19](https://github.com/19) ([#216](https://github.com/netlify/angular-runtime/issues/216)) ([f6776f5](https://github.com/netlify/angular-runtime/commit/f6776f5e532e8f61cc7a7cabd149f292d6db092f))


### Bug Fixes

* **deps:** update dependency @netlify/edge-functions to ^2.8.1 ([#119](https://github.com/netlify/angular-runtime/issues/119)) ([42904c1](https://github.com/netlify/angular-runtime/commit/42904c139c706094205dc21a84b290c3204aad13))
* **deps:** update dependency fs-extra to v11.2.0 ([#99](https://github.com/netlify/angular-runtime/issues/99)) ([186dc1e](https://github.com/netlify/angular-runtime/commit/186dc1ea3d2f2e5b379fbec2f76f7cdd77219155))
* getContext() should be sync ([#222](https://github.com/netlify/angular-runtime/issues/222)) ([1cb569c](https://github.com/netlify/angular-runtime/commit/1cb569c638a3638dfba199fb7328bda7670a8766))

## [2.1.1](https://github.com/netlify/angular-runtime/compare/v2.1.0...v2.1.1) (2024-05-27)


### Bug Fixes

* don't shadow netlify functions ([#115](https://github.com/netlify/angular-runtime/issues/115)) ([9fb04f9](https://github.com/netlify/angular-runtime/commit/9fb04f95dae41e4ea8ca264f4a53334128758626))

## [2.1.0](https://github.com/netlify/angular-runtime/compare/v2.0.7...v2.1.0) (2024-05-22)


### Features

* support Angular 18 ([#110](https://github.com/netlify/angular-runtime/issues/110)) ([a556df3](https://github.com/netlify/angular-runtime/commit/a556df3f3b987e35a1cf0d9935d1ea4c106897fe))

## [2.0.7](https://github.com/netlify/angular-runtime/compare/v2.0.6...v2.0.7) (2024-04-19)


### Bug Fixes

* remove onPreDev ([#108](https://github.com/netlify/angular-runtime/issues/108)) ([1daee4e](https://github.com/netlify/angular-runtime/commit/1daee4e282bcec32b37f451e0d96f8589a7c2c77))

## [2.0.6](https://github.com/netlify/angular-runtime/compare/v2.0.5...v2.0.6) (2024-03-04)


### Bug Fixes

* don't crash if `prerender: false` ([#101](https://github.com/netlify/angular-runtime/issues/101)) ([a72519b](https://github.com/netlify/angular-runtime/commit/a72519b8e931198f014e82c75f50cf2840444485))

## [2.0.5](https://github.com/netlify/angular-runtime/compare/v2.0.4...v2.0.5) (2024-02-02)


### Bug Fixes

* adapt publish directory based on builder ([#94](https://github.com/netlify/angular-runtime/issues/94)) ([0d2b600](https://github.com/netlify/angular-runtime/commit/0d2b6004dc05c974d0515a10dd47acc3af86ea6b))

## [2.0.4](https://github.com/netlify/angular-runtime/compare/v2.0.3...v2.0.4) (2023-11-28)


### Bug Fixes

* handle missing angular dependencis error ([#91](https://github.com/netlify/angular-runtime/issues/91)) ([b5df118](https://github.com/netlify/angular-runtime/commit/b5df11821c91c75f6a4606df5656cca6fe607e7c))
* install before publishing ([#79](https://github.com/netlify/angular-runtime/issues/79)) ([82521c8](https://github.com/netlify/angular-runtime/commit/82521c837e4aa498caa986f2b991eb2d4965d122))

## [2.0.3](https://github.com/netlify/angular-runtime/compare/v2.0.2...v2.0.3) (2023-11-27)


### Bug Fixes

* type errors due to missing failPLugin function ([#87](https://github.com/netlify/angular-runtime/issues/87)) ([db09d04](https://github.com/netlify/angular-runtime/commit/db09d04fe39576a9cd33c782f299ee287e7b2910))

## [2.0.2](https://github.com/netlify/angular-runtime/compare/v2.0.1...v2.0.2) (2023-11-09)


### Bug Fixes

* `excludedPath` contained relative paths for some prerendered static files ([#74](https://github.com/netlify/angular-runtime/issues/74)) ([5843bc8](https://github.com/netlify/angular-runtime/commit/5843bc8b89f130200899d34b3184f4072c1f5fdb))
* install run-s and run-p ([#73](https://github.com/netlify/angular-runtime/issues/73)) ([38f3e63](https://github.com/netlify/angular-runtime/commit/38f3e63741332b57cd8926c139ba1ad0ec68dbeb))
* remove `global` polyfill ([#76](https://github.com/netlify/angular-runtime/issues/76)) ([e6fab5f](https://github.com/netlify/angular-runtime/commit/e6fab5f9d29f93c26ee3d781311aa5ffe6d69fe4))
* replace `defaultProject` with environment variable ([#75](https://github.com/netlify/angular-runtime/issues/75)) ([ee4f818](https://github.com/netlify/angular-runtime/commit/ee4f81819f1b3b92c863bbcad133c9755bf4c8d0))

## [2.0.1](https://github.com/netlify/angular-runtime/compare/v2.0.0...v2.0.1) (2023-11-09)


### Bug Fixes

* add publish step to release-please ([#70](https://github.com/netlify/angular-runtime/issues/70)) ([3b58f20](https://github.com/netlify/angular-runtime/commit/3b58f2099df950aac8fdc8a3fefa89765041a85b))
* validate publish dir in buildbot ([#71](https://github.com/netlify/angular-runtime/issues/71)) ([df8f8cf](https://github.com/netlify/angular-runtime/commit/df8f8cffd95acb36e905ce01d2701cff23dbdffc))

## [2.0.0](https://www.github.com/netlify/angular-runtime/compare/v1.0.1...v2.0.0) (2023-11-08)


### ⚠ BREAKING CHANGES

* add support for Angular v17 (#67)

### Features

* add support for Angular v17 ([#67](https://www.github.com/netlify/angular-runtime/issues/67)) ([ab92862](https://www.github.com/netlify/angular-runtime/commit/ab92862aedc2b3ac8639f8da4968158b65871597))

### [1.0.1](https://www.github.com/netlify/netlify-plugin-angular-universal/compare/v1.0.0...v1.0.1) (2021-08-24)


### Bug Fixes

* **deps:** update angular monorepo to ~12.2.0 ([6f2430a](https://www.github.com/netlify/netlify-plugin-angular-universal/commit/6f2430a060dd7b7abb823303a36cbb45a286752b))
* template path, ts in serverless.ts ([#43](https://www.github.com/netlify/netlify-plugin-angular-universal/issues/43)) ([6b1a74b](https://www.github.com/netlify/netlify-plugin-angular-universal/commit/6b1a74be64c1c9768bbe60c7e718f1d91a9e7b03))

## 1.0.0 (2021-08-04)


### Features

* add basic support for angular universal alongside serverless schematic ([42b64c6](https://www.github.com/netlify/netlify-plugin-angular-universal/commit/42b64c6f3b8f36b0fb44d81094499d1015017b02))
* move demo config and add angular site root logic ([#7](https://www.github.com/netlify/netlify-plugin-angular-universal/issues/7)) ([330471a](https://www.github.com/netlify/netlify-plugin-angular-universal/commit/330471ad1dbbdd61ad91d2edd9a196f697907fdf))


### Bug Fixes

* stylesheet issue ([#9](https://www.github.com/netlify/netlify-plugin-angular-universal/issues/9)) ([df106ed](https://www.github.com/netlify/netlify-plugin-angular-universal/commit/df106ed511c7a98c353dbf4acb24b276dcbb0eb1))
* upgrade serverless express engine ([#8](https://www.github.com/netlify/netlify-plugin-angular-universal/issues/8)) ([5526778](https://www.github.com/netlify/netlify-plugin-angular-universal/commit/552677866346b3026e9bcfab1488b16575d972f0))
* catch router errors ([#21](https://github.com/netlify/netlify-plugin-angular-universal/pull/21))
