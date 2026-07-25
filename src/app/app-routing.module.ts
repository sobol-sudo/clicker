import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule)
  },
  // The app is a single screen, so any unknown path falls back to the game
  // instead of leaving an empty router-outlet behind.
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
