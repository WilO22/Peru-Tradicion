// src/app/core/guards/auth-guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// 1. Importaciones de RxJS para manejar el "esperar"
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

// 'state' aquí es el RouterStateSnapshot
export const authGuard: CanActivateFn = (route, state) => { 

  const authService = inject(Auth);
  const router = inject(Router);

  // 2. Convertimos nuestro Signal 'authState' en un Observable
  // Esto nos permite "esperar" a que emita un valor.
  return toObservable(authService.authState).pipe(

    // 3. Filtramos: Solo nos interesan los estados que NO estén "cargando"
    // Ignoramos la emisión inicial donde 'isLoading' es true.
    filter(authState => !authState.isLoading),

    // 4. Tomamos: Solo queremos el primer valor (una sola vez)
    take(1),

    // 5. Mapeamos: Decidimos si el usuario puede pasar
    map(authState => {
      // LA LÓGICA CLAVE:
      // ¿El usuario está logueado Y es admin?
      if (authState.user && authState.isAdmin) {
        return true; // ¡Sí, puede pasar!
      }

      // Si no es admin (o no está logueado), lo mandamos al login.
      router.navigate(['/login']);
      return false;
    })
  );
};