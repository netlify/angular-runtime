import { Component, Inject, OnInit, Optional } from '@angular/core'
import { RESPONSE } from '@nguniversal/express-engine/tokens'

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent implements OnInit {
  private response: Response
  constructor(@Optional() @Inject(RESPONSE) response: any) {
    this.response = response
  }

  ngOnInit(): void {
    if (this.response) {
      // @ts-ignore
      this.response.status(404)
    }
  }
}
