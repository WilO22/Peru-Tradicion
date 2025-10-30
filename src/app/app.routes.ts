import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  // Ruta Pública (con layout)
  {
    path: '',
    // ↓↓↓ CORRECCIÓN: Volvemos a m.Public (asumiendo que la clase se llama Public) ↓↓↓
    loadComponent: () =>
      import('./layout/public/public').then((m) => m.Public), 
    children: [
      {
        path: '',
        // Este es el único que usa .default porque lo cambiamos
        loadComponent: () =>
          import('./pages/home/home').then((m) => m.default), 
      },
    ],
  },
  // Rutas de Admin (con layout)
  {
    path: 'admin',
    // ↓↓↓ CORRECCIÓN: Volvemos a m.Admin ↓↓↓
    loadComponent: () =>
      import('./layout/admin/admin').then((m) => m.Admin), 
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        // ↓↓↓ CORRECCIÓN: Volvemos a m.Dashboard ↓↓↓
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard), 
      },
      {
        path: 'costumes',
        // ↓↓↓ CORRECCIÓN: Volvemos a m.ManageCostumes ↓↓↓
        loadComponent: () =>
          import('./pages/admin/manage-costumes/manage-costumes').then(
            (m) => m.ManageCostumes 
          ),
      },
    ],
  },
  // Rutas sin layout
  {
    path: 'login',
    // ↓↓↓ CORRECCIÓN: Volvemos a m.Login ↓↓↓
    loadComponent: () => import('./pages/login/login').then((m) => m.Login), 
  },
  {
    path: 'register',
    // ↓↓↓ CORRECCIÓN: Volvemos a m.Register ↓↓↓
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register), 
  },
  // NotFound
  {
    path: '**',
    // ↓↓↓ CORRECCIÓN: Volvemos a m.NotFound ↓↓↓
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound), 
  },
];