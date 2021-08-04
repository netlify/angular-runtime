import { PlatformLocation } from '@angular/common'
import { NgModule } from '@angular/core'
import { ServerModule } from '@angular/platform-server'

import { AppModule } from './app.module'
import { AppComponent } from './app.component'
import { ExpressRedirectPlatformLocation } from './express-redirect-platform-location.service'

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
  providers: [{ provide: PlatformLocation, useClass: ExpressRedirectPlatformLocation }],
})
export class AppServerModule {}
