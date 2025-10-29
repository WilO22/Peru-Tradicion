// src/app/services/auth.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth as FirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  #auth: FirebaseAuth = inject(FirebaseAuth);
  #router: Router = inject(Router);
  #userService: User = inject(User);

  // --- 1. EXPONER EL OBSERVABLE DE ESTADO ---
  // Esta será nuestra "fuente de verdad" para los guards
  readonly user$ = authState(this.#auth);

  // --- 2. MODIFICAR EL SIGNAL ---
  // Hacemos que el signal dependa de nuestro observable (más limpio)
  readonly currentUser = toSignal(this.user$);

  constructor() {
    // effect(() => {
    //   console.log('El estado del usuario ha cambiado:', this.currentUser());
    // });
  }

  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.#auth, email, password);
      const user = userCredential.user;
      if (!user) {
        throw new Error('No se pudo crear el usuario en Firebase Auth.');
      }
      await this.#userService.createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email!,
        role: 'cliente'
      });
    } catch (error) {
      console.error('Error durante el registro:', error);
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