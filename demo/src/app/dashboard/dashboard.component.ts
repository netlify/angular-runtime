import { Component, Inject, OnInit, Optional } from '@angular/core'
import { Hero } from '../hero'
import { HeroService } from '../hero.service'
import { RouterModule } from '@angular/router'
import type { Context } from '@netlify/edge-functions'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  heroes: Hero[] = []

  constructor(
    private heroService: HeroService,
    @Inject('netlify.request') @Optional() request?: Request,
    @Inject('netlify.context') @Optional() context?: Context,
  ) {
    if (request) {
      console.log(
        `Rendering page ${request.url} for client ${context?.ip ?? 'unknown IP'} from ${
          context?.geo.city ?? 'unknown city'
        } `,
      )
    }
  }

  ngOnInit() {
    this.getHeroes()
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes.slice(1, 5)))
  }
}
