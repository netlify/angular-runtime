// import { CommonEngine } from '@angular/ssr/node'

// ideally figure out how to use the real CommonEngine type from the Angular package
// as currently it causes following error (due to repo setup?)
// ✘ [ERROR] TS2345: Argument of type 'import("/Users/misiek/dev/angular-runtime/tests/fixtures/angular-19-common-engine/node_modules/@angular/ssr/node/index").CommonEngine' is not assignable to parameter of type 'import("/Users/misiek/dev/angular-runtime/node_modules/@angular/ssr/node/index").CommonEngine'.
//  Types have separate declarations of a private property 'options'. [plugin angular-compiler]
export declare function render(commonEngine: any): Promise<Response>
