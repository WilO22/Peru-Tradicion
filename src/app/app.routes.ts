// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
   
    loadComponent: () => import('./features/auth/login-page/login-page')
  },
  {
    path: 'admin',
    
    loadComponent: () => import('./features/admin/admin-layout/admin-layout'),
    children: [
      {
        path: 'dashboard',
        
        loadComponent: () => import('./features/admin/pages/dashboard-page/dashboard-page')
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '', 
   
    loadComponent: () => import('./features/public/public-layout/public-layout'),
    children: [
      {
        path: '', 
        
        loadComponent: () => import('./features/public/pages/catalog-page/catalog-page')
      }
    ]
  }
];