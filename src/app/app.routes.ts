// src/app/app.routes.ts
import { Routes } from '@angular/router';

// --- Imports Públicos ---
import { Public } from './layout/public/public';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { NotFound } from './pages/not-found/not-found';

// --- Imports para Admin ---
import { Admin } from './layout/admin/admin';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { adminGuard } from './guards/admin-guard'; // <-- ¡Nuestro Guardián!

export const routes: Routes = [
  // --- Rutas Públicas ---
  {
    path: '',
    component: Public,
    children: [
      { path: '', component: Home },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },

  // --- Ruta de Admin Protegida ---
  {
    path: 'admin',
    component: Admin, // Carga el Layout de Admin (con Sidebar)
    canActivate: [adminGuard], // <-- ¡Aquí está la protección!
    children: [
      // Redirige /admin a /admin/dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      { path: 'dashboard', component: Dashboard },
      // Próximamente añadiremos las rutas de 'manage-costumes', etc.
    ]
  },

  // --- Ruta 404 (Siempre al final) ---
  { path: '**', component: NotFound },
];