# Changelog

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
