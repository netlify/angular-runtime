import { Injectable, Inject, Optional } from '@angular/core';
import { Response, Request } from 'express';
import { DOCUMENT } from '@angular/common';
import { INITIAL_CONFIG, ɵINTERNAL_SERVER_PLATFORM_PROVIDERS } from '@angular/platform-server';
import { PlatformLocation } from '@angular/common';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

/**
 * This service can't be tested with karma, because tests are run in a browser,
 * but `express` is imported here, which requires `http` module of NodeJS.
 */

// https://github.com/angular/angular/issues/13822#issuecomment-283309920

interface IPlatformLocation {
  pushState(state: any, title: string, url: string): any;
  replaceState(state: any, title: string, url: string): any;
}

// This class is not exported
const ServerPlatformLocation: new(_doc: any, _config: any) => IPlatformLocation =
  (ɵINTERNAL_SERVER_PLATFORM_PROVIDERS as any)
    .find(provider => provider.provide === PlatformLocation)
    .useClass;


/**
 * Issue HTTP 302 redirects on internal redirects
 */
@Injectable()
export class ExpressRedirectPlatformLocation extends ServerPlatformLocation {

  constructor(
    @Inject(DOCUMENT) _doc: any,
    @Optional() @Inject(INITIAL_CONFIG) _config: any,
    @Inject(REQUEST) private req: Request,
    @Inject(RESPONSE) private res: Response,
  ) {
    super(_doc, _config);
  }

  private redirectExpress(state: any, title: string, url: string) {
    if (url === this.req.url) return;
    
    if (this.res.finished) {
      const req: any = this.req;
      req._r_count = (req._r_count || 0) + 1;

      console.warn('Attempted to redirect on a finished response. From',
        this.req.url, 'to', url);

      if (req._r_count > 10) {
        console.error('Detected a redirection loop. killing the nodejs process');
        // tslint:disable-next-line
        console.trace();
        console.log(state, title, url);
        process.exit(1);
      }
    } else {
      let status = this.res.statusCode || 0;  // attempt to use the already set status
      if (status < 300 || status >= 400) status = 302; // temporary redirect
      console.log(`Redirecting from ${this.req.url} to ${url} with ${status}`);
      this.res.redirect(status, url);
      this.res.end();
      // I haven't found a way to correctly stop Angular rendering.
      // So we just let it end its work, though we have already closed
      // the response.
    }
  }

  pushState(state: any, title: string, url: string): any {
    this.redirectExpress(state, title, url);
    return super.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): any {
    this.redirectExpress(state, title, url);
    return super.replaceState(state, title, url);
  }

}