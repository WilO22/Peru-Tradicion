// src/app/app.routes.ts
import { Routes } from '@angular/router';

// --- Importamos SOLO el Guardián ---
// Ya no necesitamos importar los componentes aquí arriba.
import { adminGuard } from './guards/admin-guard'; 

export const routes: Routes = [
  // --- Rutas Públicas (con Lazy Loading) ---
  {
    path: '',
    // Cargamos el Layout Público perezosamente
    loadComponent: () => import('./layout/public/public').then(m => m.Public), 
    children: [
      { 
        path: '', 
        // Cargamos la página Home perezosamente
        loadComponent: () => import('./pages/home/home').then(m => m.Home) 
      },
      { 
        path: 'login', 
        loadComponent: () => import('./pages/login/login').then(m => m.Login) 
      },
      { 
        path: 'register', 
        loadComponent: () => import('./pages/register/register').then(m => m.Register) 
      },
    ],
  },

  // --- Ruta de Admin Protegida (con Lazy Loading) ---
  {
    path: 'admin',
    // Cargamos el Layout de Admin perezosamente
    loadComponent: () => import('./layout/admin/admin').then(m => m.Admin), 
    canActivate: [adminGuard], // La protección (aún pendiente de fix final) sigue aquí
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }, 
      { 
        path: 'dashboard', 
        // Cargamos el Dashboard perezosamente
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard) 
      },
      // --- ¡NUEVA RUTA AÑADIDA! ---
      {
        path: 'manage-costumes',
        loadComponent: () => import('./pages/admin/manage-costumes/manage-costumes').then(m => m.Costume)
      }
    ]
  },

  // --- Ruta 404 (con Lazy Loading) ---
  { 
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) 
  },
];