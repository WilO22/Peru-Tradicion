// src/app/services/user.ts
import { Injectable, inject, computed } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Auth } from './auth';
import { UserModel } from '../interfaces/user.model';
import { User as FirebaseUser } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class User {
  #firestore: Firestore = inject(Firestore);
  #auth: Auth = inject(Auth);

  // ---
  // Fuente de verdad reactiva:
  // ---

  // 1. Obtenemos el Signal de Auth.
  // Su tipo real es: Signal<FirebaseUser | null | undefined>
  readonly #firebaseUser = this.#auth.currentUser;

  // 2. Convertimos el Signal en un Observable.
  // Su tipo real es: Observable<FirebaseUser | null | undefined>
  readonly #firebaseUser$ = toObservable(this.#firebaseUser);

  // 3. Creamos el Observable del perfil
  readonly currentUserProfile$: Observable<UserModel | null> = this.#firebaseUser$.pipe(
    
    // ↓↓↓ LA ÚNICA CORRECCIÓN ESTÁ AQUÍ ↓↓↓
    // Añadimos 'undefined' a los tipos de entrada del 'user'
    switchMap((user: FirebaseUser | null | undefined) => {
      
      // La lógica 'if (user)' funciona perfectamente
      // para 'null' y 'undefined', por lo que el resto es idéntico.
      if (user) {
        // Si hay usuario logueado, busca su perfil en Firestore
        const userDocRef = doc(this.#firestore, `users/${user.uid}`);
        return docData(userDocRef) as Observable<UserModel | null>;
      } else {
        // Si no hay usuario (es null o undefined), emite 'null'
        return of(null);
      }
    })
  );

  // 4. Convertimos el Observable de vuelta a un Signal público
  // El tipo de salida de 'currentUserProfile$' es 'Observable<UserModel | null>',
  // por lo que 'currentUserProfile' será 'Signal<UserModel | null | undefined>'
  readonly currentUserProfile = toSignal(this.currentUserProfile$);

  // 5. Creamos un Signal 'computed' para saber si es admin
  readonly isAdmin = computed(() => this.currentUserProfile()?.role === 'admin');

  constructor() {}

  // Método para crear el perfil en Firestore (usado por 'auth.ts')
  createUserProfile(uid: string, data: UserModel) {
    const userDocRef = doc(
      this.#firestore,
      `users/${uid}`
    ) as DocumentReference<UserModel>;
    return setDoc(userDocRef, data);
  }
}