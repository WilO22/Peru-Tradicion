// src/app/services/storage.ts
import { Injectable, inject, signal } from '@angular/core';

// --- CORRECCIÓN 1: Renombramos la clase importada ---
import { Storage as FirebaseStorage } from '@angular/fire/storage'; // ¡El inyectable!

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from 'firebase/storage';

import { Auth } from './auth';
import { Observable, Subject } from 'rxjs';

// El tipo 'UploadStatus' (sin cambios)
export interface UploadStatus {
  progress: number;
  downloadURL?: string;
}

// Nuestra clase MANTIENE su nombre, acorde a la CLI de Angular 20
@Injectable({
  providedIn: 'root',
})
export class Storage { 
  // --- CORRECCIÓN 2: Inyectamos el tipo renombrado ---
  #storage: FirebaseStorage = inject(FirebaseStorage);
  #auth = inject(Auth);

  constructor() {}

  /**
   * Sube un archivo a Firebase Storage.
   * (El resto del método 'uploadFile' es idéntico)
   */
  uploadFile(file: File, path: string): Observable<UploadStatus> {
    const statusSubject = new Subject<UploadStatus>();
    
    const fileId = `${Date.now()}_${file.name}`;
    
    const storageRef = ref(this.#storage, `${path}/${fileId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        statusSubject.next({ progress: progress });
      },
      
      (error) => {
        console.error('Error en subida:', error);
        statusSubject.error(error);
      },
      
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        statusSubject.next({ progress: 100, downloadURL: downloadURL });
        statusSubject.complete();
      }
    );

    return statusSubject.asObservable();
  }
}