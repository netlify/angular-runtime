import { Component, Inject, OnInit, Optional } from '@angular/core'
import { RESPONSE } from '@nguniversal/express-engine/tokens'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Response } from 'express'

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent implements OnInit {
  private response: Response
  path: Observable<string>

  constructor(route: ActivatedRoute, @Optional() @Inject(RESPONSE) response: any) {
    this.response = response
    this.path = route.url.pipe(map((segments) => segments.join('/')))
  }

  ngOnInit(): void {
    if (this.response) {
      this.response.status(404)
    }
  }
}
