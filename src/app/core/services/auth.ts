// src/app/core/services/auth.ts

import { Injectable, computed, inject, signal, effect, untracked } from '@angular/core'; // <-- Añade effect y untracked
import { Router } from '@angular/router'; // <-- Añade Router
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Firestore as FirebaseFirestore, doc, getDoc } from '@angular/fire/firestore';

type AuthState = User | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private auth: FirebaseAuth = inject(FirebaseAuth);
  private firestore = inject(FirebaseFirestore);
  private router = inject(Router); // <-- Inyecta el Router

  // --- Signals de Estado ---
  readonly #currentUser = signal<AuthState>(undefined);
  readonly #isAdmin = signal<boolean | undefined>(undefined); // <-- Cambiado a undefined inicial

  // --- Signals Públicos ---
  public readonly currentUser = this.#currentUser.asReadonly();
  public readonly isAdmin = this.#isAdmin.asReadonly();

  // Signal computado para saber si estamos cargando
  public readonly isLoading = computed(() =>
    this.#currentUser() === undefined || this.#isAdmin() === undefined
  );

  // Signal computado para el estado completo (simplificado)
  public readonly authState = computed(() => {
    return {
      user: this.#currentUser(),
      isAdmin: this.#isAdmin() ?? false, // <-- Si es undefined, trátalo como false
      isLoading: this.isLoading()
    }
  });

  constructor() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Ponemos el usuario inmediatamente, pero isAdmin aún no se sabe
        this.#currentUser.set(user);
        this.#isAdmin.set(undefined); // <-- Indica que estamos buscando el rol

        const userDocRef = doc(this.firestore, 'admins', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          this.#isAdmin.set(true);
          // NAVEGACIÓN DESDE EL SERVICIO: Si es admin, lo mandamos al dashboard
          // Usamos untracked para evitar bucles si la navegación causa otro cambio de estado
          untracked(() => this.router.navigate(['/admin']));
        } else {
          this.#isAdmin.set(false);
          // Si NO es admin, lo mandamos explícitamente al login (o a donde quieras)
          // Puedes comentar esta línea si prefieres que se quede donde esté
          untracked(() => this.router.navigate(['/login']));
        }
      }
      else {
        this.#currentUser.set(null);
        this.#isAdmin.set(false); // <-- Asegura que isAdmin sea false al hacer logout
      }
    });
  }

  loginWithGoogle() {
    // Ya no necesitamos esperar aquí, onAuthStateChanged se encargará
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout() {
     // Aseguramos la redirección al login tras cerrar sesión
     return signOut(this.auth).then(() => {
       this.router.navigate(['/login']);
     });
  }
}