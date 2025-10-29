// src/app/services/user.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { UserProfile } from '../interfaces/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class User { // Este es nuestro Servicio 'User'

  // Inyectamos Firestore para acceder a la base de datos
  #firestore: Firestore = inject(Firestore);

  constructor() { }

  /**
   * Crea un nuevo documento de perfil de usuario en Firestore
   * Se usa 'Partial' por si no queremos enviar todos los datos al crear
   * @param uid El ID de usuario de Firebase Auth
   * @param data El objeto de perfil
   */
  createUserProfile(uid: string, data: Partial<UserProfile>) {
    // Creamos una referencia al documento en la colección 'users'
    // Esta es la ruta: coleccion/documento
    const userDocRef = doc(this.#firestore, `users/${uid}`);
    
    // Usamos setDoc para escribir los datos.
    // 'merge: true' es una buena práctica por si el doc ya existe
    return setDoc(userDocRef, data, { merge: true });
  }

  /**
   * Obtiene un Observable con el perfil de un usuario de Firestore
   * @param uid El ID de usuario de Firebase Auth
   */
  getUserProfile(uid: string) {
    const userDocRef = doc(this.#firestore, `users/${uid}`);
    
    // docData nos da un Observable que emite los datos del documento
    // en tiempo real.
    return docData(userDocRef) as Observable<UserProfile>;
  }
}