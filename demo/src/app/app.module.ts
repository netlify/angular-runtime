import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { MessagesComponent } from './messages/messages.component'

@NgModule({
  declarations: [AppComponent, MessagesComponent],
  imports: [BrowserModule.withServerTransition({ appId: 'serverApp' }), FormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
