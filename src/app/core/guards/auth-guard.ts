// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// Importamos nuestra clase de servicio 'Auth'
import { Auth } from '../services/auth';

// Este es nuestro Guard funcional (no es una clase)
export const authGuard: CanActivateFn = (route, state) => {

  // 1. INYECCIÓN DE DEPENDENCIAS MODERNA (Principio 4)
  // Usamos inject() para traer nuestro Auth y el Router
  const authService = inject(Auth);
  const router = inject(Router);

  // 2. Lógica del Guard
  // Consultamos el Signal de nuestro servicio
  if (authService.currentUser()) {
    // Si el usuario existe (está logueado), permite el acceso
    return true; 
  }

  // Si el usuario es 'null' (no logueado),
  // lo redirigimos a la página de login y bloqueamos el acceso.
  router.navigate(['/login']);
  return false;
};