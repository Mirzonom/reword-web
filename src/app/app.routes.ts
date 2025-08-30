import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: '/learn', pathMatch: 'full'},
  {
    path: 'learn',
    loadComponent: () => import('./pages/learn/learn').then(m => m.Learn)
  },
  {
    path: 'dictionary',
    loadComponent: () => import('./pages/dictionary/dictionary').then(m => m.Dictionary)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
  },
  {path: '**', redirectTo: '/learn'}
];
