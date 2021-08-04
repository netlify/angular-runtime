import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HeroesComponent } from './heroes/heroes.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { HeroDetailComponent } from './hero-detail/hero-detail.component'
import { NotFoundComponent } from './not-found/not-found.component'

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: HeroDetailComponent },
  { path: 'heroes', component: HeroesComponent },
  { path: '**', component: NotFoundComponent },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
  declarations: [DashboardComponent, HeroDetailComponent, HeroesComponent, NotFoundComponent],
})
export class AppRoutingModule {}
