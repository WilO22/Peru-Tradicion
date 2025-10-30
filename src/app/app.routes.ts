// // src/app/app.routes.ts
// import { Routes } from '@angular/router';

// // --- Imports Públicos ---
// import { Public } from './layout/public/public';
// import { Home } from './pages/home/home';
// import { Login } from './pages/login/login';
// import { Register } from './pages/register/register';
// import { NotFound } from './pages/not-found/not-found';

// // --- Imports para Admin ---
// import { Admin } from './layout/admin/admin';
// import { Dashboard } from './pages/admin/dashboard/dashboard';
// import { adminGuard } from './guards/admin-guard'; // <-- ¡Nuestro Guardián!

// export const routes: Routes = [
//   // --- Rutas Públicas ---
//   {
//     path: '',
//     component: Public,
//     children: [
//       { path: '', component: Home },
//       { path: 'login', component: Login },
//       { path: 'register', component: Register },
//     ],
//   },

//   // --- Ruta de Admin Protegida ---
//   {
//     path: 'admin',
//     component: Admin, // Carga el Layout de Admin (con Sidebar)
//     canActivate: [adminGuard], // <-- ¡Aquí está la protección!
//     children: [
//       // Redirige /admin a /admin/dashboard
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
//       { path: 'dashboard', component: Dashboard },
//       // Próximamente añadiremos las rutas de 'manage-costumes', etc.
//     ]
//   },

//   // --- Ruta 404 (Siempre al final) ---
//   { path: '**', component: NotFound },
// ];

// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Ya NO necesitamos importar los componentes aquí arriba

// --- Importamos SOLO el Guardián ---
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
    canActivate: [adminGuard], // La protección sigue igual
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
      // Próximamente añadiremos las rutas 'manage-costumes', etc., también con loadComponent
    ]
  },

  // --- Ruta 404 (con Lazy Loading) ---
  { 
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) 
  },
];