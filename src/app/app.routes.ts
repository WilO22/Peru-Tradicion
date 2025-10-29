// src/app/app.routes.ts

import { Routes } from '@angular/router';

// --- Principio Standalone: Importamos los componentes que usaremos en las rutas ---
import { Public } from './layout/public/public';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  // --- Rutas Públicas ---
  // Todas las rutas dentro de este 'children'
  // se renderizarán dentro del <router-outlet> de 'Public'.
  {
    path: '',
    component: Public, // El layout público (con header/footer)
    children: [
      { path: '', component: Home }, // Ruta: (vacío) -> Carga Home
      { path: 'login', component: Login }, // Ruta: /login -> Carga Login
      { path: 'register', component: Register }, // Ruta: /register -> Carga Register
    ],
  },

  // --- Rutas de Admin (aún por proteger) ---
  // Las definiremos en el siguiente paso.

  // --- Ruta 404 ---
  // El 'wildcard' (**) captura cualquier ruta no definida.
  // Debe ir SIEMPRE al final.
  { path: '**', component: NotFound },
];