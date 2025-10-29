// src/app/guards/admin-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
// Importamos 'filter' para esperar el estado definitivo
import { map, switchMap, take, of, filter } from 'rxjs'; 

import { Auth } from '../services/auth';
import { User } from '../services/user';
import { UserProfile } from '../interfaces/user.model';

// --- LA CORRECCIÓN ESTÁ AQUÍ ---
// Importamos 'User' directamente y lo renombramos a 'FirebaseUser' EN ESTE ARCHIVO
import { User as FirebaseUser } from '@angular/fire/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(Auth);
  const userService = inject(User);
  const router = inject(Router);

  return authService.user$.pipe(
    // --- LA CORRECCIÓN CLAVE ---
    // filter espera hasta que el valor emitido NO sea 'undefined'.
    // Esto nos asegura que Firebase Auth ya inicializó su estado.
    // 'Boolean' es un truco corto para filtrar null y undefined.
    filter((user: FirebaseUser | null | undefined): user is FirebaseUser | null => user !== undefined), 
    
    take(1), // Una vez que tenemos un valor (User o null), tomamos solo ese.
    
    switchMap(firebaseUser => {
      // CASO 1: Estado definitivo es 'null' (no logueado)
      if (!firebaseUser) {
        console.log('adminGuard: No hay usuario, redirigiendo a /login');
        return of(router.createUrlTree(['/login']));
      }

      // CASO 2: Hay usuario. Obtener su perfil de Firestore.
      return userService.getUserProfile(firebaseUser.uid).pipe(
        map((userProfile: UserProfile | undefined) => {
          // CASO 3: Es Admin
          if (userProfile && userProfile.role === 'admin') {
            console.log('adminGuard: Acceso concedido (Admin)');
            return true; 
          }

          // CASO 4: Es Cliente (o no tiene perfil)
          console.log('adminGuard: Acceso denegado (No es Admin), redirigiendo a /');
          return router.createUrlTree(['/']); 
        })
      );
    })
  );
};