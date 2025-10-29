// import { CanActivateFn } from '@angular/router';

// export const adminGuard: CanActivateFn = (route, state) => {
//   return true;
// };


// src/app/guards/admin-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators'; // Importamos 'map' de RxJS

// 1. IMPORTAMOS NUESTROS SERVICIOS
import { Auth } from '../services/auth';
import { User } from '../services/user'; // Necesitamos este para obtener el perfil/rol
import { firstValueFrom } from 'rxjs'; // Para convertir el Observable del perfil en una Promesa

export const adminGuard: CanActivateFn = async (route, state) => {
  // --- Principios Fundamentales en Acción ---

  // 2. INYECCIÓN DE DEPENDENCIAS CON inject() DENTRO DEL GUARD
  const authService = inject(Auth);
  const userService = inject(User);
  const router = inject(Router);

  // 3. OBTENER EL USUARIO AUTENTICADO (SIGNAL)
  const firebaseUser = authService.currentUser(); // Accedemos al valor actual del signal

  if (firebaseUser) {
    // 4. SI HAY USUARIO EN AUTH, OBTENER SU PERFIL DE FIRESTORE (ROL)
    try {
      // getUserProfile devuelve un Observable, lo convertimos a Promesa
      // para poder usar await y simplificar la lógica asíncrona aquí.
      const userProfile = await firstValueFrom(userService.getUserProfile(firebaseUser.uid));

      // 5. LA LÓGICA DE NEGOCIO: ¿ES ADMIN?
      if (userProfile && userProfile.role === 'admin') {
        return true; // ¡Sí tiene permiso! Deja pasar.
      } else {
        // No es admin, redirigir al home (o a una página de 'acceso denegado')
        console.warn('Acceso denegado: El usuario no es administrador.');
        router.navigate(['/']); // Redirige al Home
        return false; // Bloquea la navegación.
      }
    } catch (error) {
      // Error al obtener el perfil (ej. Firestore no disponible)
      console.error('Error al obtener perfil en adminGuard:', error);
      router.navigate(['/']); // Mejor redirigir a home por seguridad
      return false; // Bloquea la navegación.
    }

  } else {
    // 6. SI NO HAY USUARIO EN AUTH, REDIRIGIR A LOGIN
    console.log('Acceso denegado: Usuario no autenticado.');
    router.navigate(['/login']); // Redirige al Login
    return false; // Bloquea la navegación.
  }
};