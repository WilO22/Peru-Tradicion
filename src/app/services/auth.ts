// src/app/services/auth.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

// 1. GESTIÓN DE NOMBRES (PROACTIVO)
import {
  Auth as FirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User as FirebaseUser, // <-- Renombramos 'User' a 'FirebaseUser'
  createUserWithEmailAndPassword // <-- Importamos la función de registro
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

// 2. INYECTAMOS NUESTRO OTRO SERVICIO
import { User } from './user'; // <-- Importamos nuestro servicio 'User' (de perfiles)

@Injectable({
  providedIn: 'root'
})
export class Auth { // <-- Nuestro servicio de Autenticación

  #auth: FirebaseAuth = inject(FirebaseAuth);
  #router: Router = inject(Router);
  #userService: User = inject(User); // <-- 3. Inyectamos nuestro servicio 'User'

  // 4. Actualizamos el tipo del signal
  readonly currentUser = toSignal(authState(this.#auth));

  constructor() {
    // effect(() => {
    //   console.log('El estado del usuario ha cambiado:', this.currentUser());
    // });
  }

  // --- Métodos Públicos ---

  /**
   * Registra un nuevo usuario y crea su perfil en Firestore
   */
  async register(email: string, password: string) {
    try {
      // --- PASO 1: Crear el usuario en Firebase Authentication ---
      const userCredential = await createUserWithEmailAndPassword(this.#auth, email, password);
      
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('No se pudo crear el usuario en Firebase Auth.');
      }

      // --- PASO 2: Crear el perfil del usuario en Firestore ---
      // Usamos nuestro servicio 'User' inyectado
      await this.#userService.createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email!, // El email no será nulo en este punto
        role: 'cliente' // <-- ¡Aquí asignamos el ROL por defecto!
      });

      // (Opcional) Si el registro es exitoso, puedes redirigir
      // this.#router.navigate(['/']); 

    } catch (error) {
      // Manejo de errores (ej. "el email ya está en uso")
      console.error('Error durante el registro:', error);
      // Relanzamos el error para que el componente que lo llamó lo pueda gestionar
      throw error; 
    }
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.#auth, email, password);
  }

  logout() {
    signOut(this.#auth)
      .then(() => {
        this.#router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  }
}