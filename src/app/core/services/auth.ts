// src/app/core/services/auth.ts

import { Injectable, inject, signal } from '@angular/core';

// 1. LA CORRECCIÓN:
// Importamos 'Auth' pero lo renombramos a 'FirebaseAuth'
// para evitar la colisión con nuestra clase local 'Auth'.
import { 
  Auth as FirebaseAuth, // <-- ¡Aquí está la magia!
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User 
} from '@angular/fire/auth';

// El tipo para nuestro Signal de estado de autenticación
type AuthState = User | null | undefined;

@Injectable({
  providedIn: 'root'
})
// 2. Mantenemos el nombre de tu clase (sin sufijo)
export class Auth { 

  // 3. Usamos el alias 'FirebaseAuth' para la inyección y el tipado
  private auth: FirebaseAuth = inject(FirebaseAuth);

  // GESTIÓN DE ESTADO CON SIGNALS (Principio 1)
  readonly #currentUser = signal<AuthState>(undefined);
  public readonly currentUser = this.#currentUser.asReadonly();

  constructor() {
    // Usamos 'this.auth' (que es la instancia de FirebaseAuth)
    this.auth.onAuthStateChanged(user => {
      this.#currentUser.set(user);
    });
  }

  // Método para iniciar sesión con Google
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Método para cerrar sesión
  logout() {
    return signOut(this.auth);
  }
}