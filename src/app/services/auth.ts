// src/app/services/auth.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

// 1. LA SOLUCIÓN: Renombramos la 'Auth' de Firebase a 'FirebaseAuth'
import {
  Auth as FirebaseAuth, // <-- ¡AQUÍ ESTÁ LA MAGIA!
  signInWithEmailAndPassword,
  signOut,
  authState,
  User
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class Auth { // <-- Nuestra clase se mantiene con el nombre moderno

  // --- Principios Fundamentales en Acción ---

  // 2. Usamos el nuevo nombre 'FirebaseAuth' para el tipo y para el 'inject'
  #auth: FirebaseAuth = inject(FirebaseAuth);
  #router: Router = inject(Router);

  // 3. 'authState' viene de nuestra importación renombrada y funciona igual
  readonly currentUser = toSignal(authState(this.#auth));

  constructor() {
    // effect(() => {
    //   console.log('El estado del usuario ha cambiado:', this.currentUser());
    // });
  }

  // --- Métodos Públicos ---

  login(email: string, password: string) {
    // 4. Usamos 'this.#auth' (que ahora es de tipo FirebaseAuth)
    return signInWithEmailAndPassword(this.#auth, email, password);
  }

  logout() {
    // 5. Usamos 'this.#auth'
    signOut(this.#auth)
      .then(() => {
        this.#router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  }
}