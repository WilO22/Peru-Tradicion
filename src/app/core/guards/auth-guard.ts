// src/app/core/guards/auth-guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(Auth);
  const router = inject(Router);

  // Convertimos el signal isLoading a Observable
  return toObservable(authService.isLoading).pipe(
    // Esperamos hasta que isLoading sea false
    filter(loading => !loading),
    // Tomamos solo el primer valor (cuando termina de cargar)
    take(1),
    // Mapeamos al resultado final
    map(() => {
      // Leemos el estado actual (ya no está cargando)
      const currentAuthState = authService.authState();
      if (currentAuthState.user && currentAuthState.isAdmin) {
        return true; // Permitir acceso
      } else {
        // Si no es admin o no está logueado, redirigir a login
        router.navigate(['/login']);
        return false;
      }
    })
  );
};