// src/app/guards/admin-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '../services/user'; // Importamos nuestro servicio User
import { first, map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const userSvc = inject(User);
  const router = inject(Router);

  // Usamos el observable del perfil de usuario,
  // que ya combina Auth y Firestore
  return userSvc.currentUserProfile$.pipe(
    first(), // Tomamos solo el primer valor (el estado actual)
    map(profile => {

      // Caso 1: El perfil existe y es 'admin'
      if (profile && profile.role === 'admin') {
        return true;
      }

      // Caso 2: El perfil existe y NO es 'admin'
      if (profile && profile.role !== 'admin') {
         return router.createUrlTree(['/']); // Redirigir a Home
      }

      // Caso 3: No hay perfil (usuario no logueado)
      return router.createUrlTree(['/login']); // Redirigir a Login
    })
  );
};