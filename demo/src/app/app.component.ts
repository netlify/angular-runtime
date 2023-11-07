import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { MessagesComponent } from './messages/messages.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessagesComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Tour of Heroes'
}
