// src/app/guards/admin-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
// Importamos 'firstValueFrom' y 'filter'
import { firstValueFrom, filter, map, take } from 'rxjs'; 

import { Auth } from '../services/auth';
import { User } from '../services/user'; // Nuestro servicio de perfiles
import { UserProfile } from '../interfaces/user.model';
import { User as FirebaseUser } from '@angular/fire/auth'; // Renombramos aquí

export const adminGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  
  const authService = inject(Auth);
  const userService = inject(User);
  const router = inject(Router);

  try {
    // 1. ESPERAR ESTADO DE AUTH DEFINITIVO (NO undefined):
    //    Usamos 'filter' para ignorar el estado inicial 'undefined'
    //    y 'firstValueFrom' para esperar la primera emisión (FirebaseUser o null).
    console.log('adminGuard: Esperando estado de Auth...');
    const firebaseUser = await firstValueFrom(
      authService.user$.pipe(
        filter((user): user is FirebaseUser | null => user !== undefined),
        take(1) // Asegura que solo tomamos el primer valor no undefined
      )
    );
    console.log('adminGuard: Estado de Auth recibido:', firebaseUser ? `Usuario ${firebaseUser.uid}` : 'null');


    // 2. SI NO HAY USUARIO, redirigir a login.
    if (!firebaseUser) {
      console.log('adminGuard: No hay usuario autenticado, redirigiendo a /login');
      return router.createUrlTree(['/login']); 
    }

    // 3. SI HAY USUARIO, obtener su perfil de Firestore.
    console.log('adminGuard: Obteniendo perfil para uid:', firebaseUser.uid);
    // Usamos firstValueFrom directamente en getUserProfile (que devuelve Observable)
    const userProfile = await firstValueFrom(userService.getUserProfile(firebaseUser.uid));
    console.log('adminGuard: Perfil obtenido:', userProfile);


    // 4. SI ES ADMIN, permitir acceso.
    if (userProfile?.role === 'admin') {
      console.log('adminGuard: Perfil de Admin encontrado. Acceso concedido.');
      return true; 
    }
    
    // 5. SI NO ES ADMIN (o no tiene perfil), redirigir al Home.
    console.warn('adminGuard: Perfil no es Admin o no existe. Acceso denegado, redirigiendo a /');
    return router.createUrlTree(['/']); 

  } catch (error) {
    // 6. MANEJO DE ERRORES GENERAL (Auth o Firestore):
    console.error('adminGuard: Error durante la verificación:', error);
    // Por seguridad, redirigimos a Home si algo falla.
    return router.createUrlTree(['/']); 
  }
};