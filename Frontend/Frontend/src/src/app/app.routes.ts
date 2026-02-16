import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },

  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'boxes', loadComponent: () => import('./pages/boxes/boxes.page').then(m => m.BoxesPage) },
      { path: 'items', loadComponent: () => import('./pages/items/items.page').then(m => m.ItemsPage) },
      { path: 'packing', loadComponent: () => import('./pages/packing/packing.page').then(m => m.PackingPage) },
      { path: 'search', loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage) },
    ],
  },

  { path: '**', redirectTo: '' },
];
