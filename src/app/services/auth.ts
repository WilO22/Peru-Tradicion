// src/app/services/auth.ts
import { Injectable, inject, Injector } from '@angular/core'; // <-- 1. Importar Injector
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
import { User } from './user'; // <-- 2. Lo mantenemos, pero solo para tipos y la inyección lazy

@Injectable({
  providedIn: 'root'
})
export class Auth {

  #auth: FirebaseAuth = inject(FirebaseAuth);
  #router: Router = inject(Router);
  #injector: Injector = inject(Injector); // <-- 3. Inyectar el Injector principal

  // --- 4. ELIMINAR LA INYECCIÓN DIRECTA DEL CAMPO ---
  // #userService: User = inject(User); // <-- ESTA LÍNEA SE ELIMINA (causaba el ciclo)

  // El resto de tu código de estado permanece idéntico
  readonly user$ = authState(this.#auth);
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

      // --- 5. INYECCIÓN LAZY (PEREZOSA) ---
      // Obtenemos el servicio User SÓLO cuando este método se llama
      const userService = this.#injector.get(User); 

      await userService.createUserProfile(user.uid, {
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