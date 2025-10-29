// src/app/guards/admin-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { firstValueFrom, filter, map, take, switchMap, of, catchError, Observable, from, tap } from 'rxjs';

import { Auth } from '../services/auth';
import { User } from '../services/user';
import { UserProfile } from '../interfaces/user.model';
import { User as FirebaseUser } from '@angular/fire/auth';

// --- Función Auxiliar Reutilizable ---
function checkAdminRoleAndRedirect(
  firebaseUser: FirebaseUser | null,
  userService: User,
  router: Router
): Observable<boolean | UrlTree> {
  if (!firebaseUser) {
    console.log('checkAdminRole: No hay usuario autenticado, redirigiendo a /login');
    return of(router.createUrlTree(['/login']));
  }

  console.log('checkAdminRole: Usuario autenticado encontrado (uid:', firebaseUser.uid, '). Obteniendo perfil...');

  // Convierte la Promesa/Observable en Observable y procesa el perfil
  return from(firstValueFrom(userService.getUserProfile(firebaseUser.uid))).pipe(
    map((userProfile: UserProfile | undefined) => {
      if (userProfile?.role === 'admin') {
        console.log('checkAdminRole: Perfil de Admin encontrado. Acceso concedido.');
        return true;
      }

      console.warn('checkAdminRole: Perfil no es Admin o no existe. Acceso denegado, redirigiendo a /');
      return router.createUrlTree(['/']);
    }),
    catchError((error) => {
      console.error('checkAdminRole: Error al obtener perfil de Firestore:', error);
      return of(router.createUrlTree(['/']));
    })
  );
}
// --- FIN Función Auxiliar ---


// --- Guardián Principal ---
export const adminGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(Auth);
  const userService = inject(User);
  const router = inject(Router);

  const currentUserSignal = authService.currentUser();
  console.log('adminGuard: Valor inicial del Signal:', currentUserSignal);

  if (currentUserSignal === undefined) {
    console.log('adminGuard: Signal indefinido. Esperando el primer valor del Observable user$...');
    return authService.user$.pipe(
      tap(user => console.log('adminGuard: (Esperando) user$ emitió:', user)),
      filter((user): user is FirebaseUser | null => user !== undefined),
      take(1),
      switchMap(firebaseUserFromObservable => {
        console.log('adminGuard: (Esperando) Estado Auth definitivo recibido:', firebaseUserFromObservable ? `Usuario ${firebaseUserFromObservable.uid}` : 'null');
        return checkAdminRoleAndRedirect(firebaseUserFromObservable, userService, router);
      }),
      catchError((error) => {
        console.error('adminGuard: Error inesperado esperando user$:', error);
        return of(router.createUrlTree(['/login']));
      })
    );
  } else {
    console.log('adminGuard: Signal tiene un valor. Procediendo directamente.');
    return checkAdminRoleAndRedirect(currentUserSignal as FirebaseUser | null, userService, router);
  }
};