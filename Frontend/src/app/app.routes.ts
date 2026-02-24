import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'boxes',
        loadComponent: () => import('./pages/boxes/boxes.component').then(m => m.BoxesComponent),
      },
      {
        path: 'items',
        loadComponent: () => import('./pages/items/items.component').then(m => m.ItemsComponent),
      },
      {
        path: 'packing',
        loadComponent: () => import('./pages/packing/packing.component').then(m => m.PackingComponent),
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
