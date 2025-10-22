// src/app/core/services/auth.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';

// 1. IMPORTAMOS LO NECESARIO PARA FIRESTORE
import { Firestore as FirebaseFirestore, doc, getDoc } from '@angular/fire/firestore';

type AuthState = User | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class Auth { 

  private auth: FirebaseAuth = inject(FirebaseAuth);
  // 2. INYECTAMOS FIRESTORE
  private firestore = inject(FirebaseFirestore);

  // --- Signals de Estado ---
  readonly #currentUser = signal<AuthState>(undefined);
  // 3. NUEVO SIGNAL PARA EL ROL DE ADMIN
  readonly #isAdmin = signal<boolean>(false);

  // --- Signals Públicos ---
  public readonly currentUser = this.#currentUser.asReadonly();
  // 4. HACEMOS PÚBLICO EL SIGNAL DE ADMIN
  public readonly isAdmin = this.#isAdmin.asReadonly();

  // 5. NUEVO SIGNAL COMPUTADO DE "ESTADO TOTAL"
  // Útil para saber si ya terminamos de cargar (usuario + rol)
  public readonly authState = computed(() => {
    return {
      user: this.#currentUser(),
      isAdmin: this.#isAdmin(),
      isLoading: this.#currentUser() === undefined
    }
  });

  constructor() {
    this.auth.onAuthStateChanged(async (user) => {
      // Si el usuario inicia sesión...
      if (user) {
        this.#currentUser.set(user);
        // ...vamos a Firestore a comprobar si es admin
        const userDocRef = doc(this.firestore, 'admins', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        // Si el documento con su UID existe en la colección 'admins'...
        if (userDocSnap.exists()) {
          this.#isAdmin.set(true); // ...¡Es admin!
        } else {
          this.#isAdmin.set(false); // ...No es admin.
        }
      } 
      // Si el usuario cierra sesión...
      else {
        this.#currentUser.set(null);
        this.#isAdmin.set(false);
      }
    });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout() {
    return signOut(this.auth);
  }
}