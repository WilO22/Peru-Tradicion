// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Revisa que estas rutas de importación coincidan con tu estructura
// y que las clases exportadas se llamen 'Public', 'Home', etc.
import { Public } from './layout/public/public';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Public, // Carga el Layout 'Public'
    children: [
      { path: '', component: Home }, // En la raíz, carga 'Home'
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },
  { path: '**', component: NotFound }, // Captura todas las demás rutas
];