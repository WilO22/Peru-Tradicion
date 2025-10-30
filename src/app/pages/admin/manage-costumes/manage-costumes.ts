// src/app/services/costume.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  DocumentReference,
  CollectionReference,
  FirestoreDataConverter, 
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue // Importamos WithFieldValue
} from '@angular/fire/firestore';
import { CostumeModel } from '../../../interfaces/costume.model'; // Usamos el nombre corregido
import { Observable } from 'rxjs';
// Importamos Signal de @angular/core para el tipado
import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

// --- Conversor de Firestore (Corregido) ---
const costumeConverter: FirestoreDataConverter<CostumeModel> = {
  // toFirestore: Se llama cuando usamos setDoc() o addDoc()
  // Acepta el objeto completo (con 'id')
  toFirestore(costume: WithFieldValue<CostumeModel>): DocumentData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = costume; // Excluimos el 'id' ANTES de guardarlo
    return data;
  },
  
  // fromFirestore: Se llama cuando leemos datos
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CostumeModel {
    const data = snapshot.data(options)!; 
    return {
      id: snapshot.id, // Añadimos el 'id' del documento a nuestro objeto
      name: data['name'],
      region: data['region'],
      price: data['price'],
      image: data['image'],
      sizes: data['sizes'],
      description: data['description']
    } as CostumeModel; 
  }
};
// --- Fin Conversor ---

@Injectable({
  providedIn: 'root'
})
export class Costume { 

  // --- CORRECCIÓN 1: Inyectar y Declarar ---
  #firestore: Firestore = inject(Firestore);

  // DECLARAMOS las propiedades aquí, pero NO las inicializamos
  readonly #costumesCollection: CollectionReference<CostumeModel>; 
  readonly costumes$: Observable<CostumeModel[]>;
  readonly costumes: Signal<CostumeModel[]>; // Usamos el tipo Signal

  constructor() {
    // --- CORRECCIÓN 2: Inicializar en el Constructor ---
    // 1. Inicializamos la colección (usando #firestore, que ya está disponible)
    this.#costumesCollection = collection(this.#firestore, 'costumes')
        .withConverter(costumeConverter); 
    
    // 2. Inicializamos el Observable (usando #costumesCollection)
    this.costumes$ = collectionData(this.#costumesCollection) as Observable<CostumeModel[]>;
    
    // 3. Inicializamos el Signal (usando costumes$)
    this.costumes = toSignal(this.costumes$, { initialValue: [] });
  }

  // --- Operaciones CRUD (Corregidas) ---

  addCostume(costumeData: Omit<CostumeModel, 'id'>) {
    // CORRECCIÓN 3: Casteamos a CostumeModel para que coincida
    // con lo que espera el conversor toFirestore
    return addDoc(this.#costumesCollection, costumeData as CostumeModel);
  }

  deleteCostume(costumeId: string) {
    // deleteDoc no usa el conversor, solo necesita la ruta
    const costumeDocRef = doc(this.#firestore, `costumes/${costumeId}`);
    return deleteDoc(costumeDocRef);
  }

  updateCostume(costumeId: string, updatedData: Partial<Omit<CostumeModel, 'id'>>) {
    // updateDoc tampoco usa el conversor, solo la ruta y datos parciales
    const costumeDocRef = doc(this.#firestore, `costumes/${costumeId}`);
    return updateDoc(costumeDocRef, updatedData);
  }
}