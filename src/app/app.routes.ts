// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page/login-page')
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout'),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/pages/dashboard-page/dashboard-page')
      },
      // --- 👇 AÑADE ESTA NUEVA RUTA ---
      {
        path: 'manage-costumes', // La URL será /admin/manage-costumes
        loadComponent: () => import('./features/admin/pages/manage-costumes/manage-costumes')
      },
      // ---------------------------------
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // ... (ruta pública) ...
];