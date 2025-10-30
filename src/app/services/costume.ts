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
  WithFieldValue // Importamos WithFieldValue para el conversor
} from '@angular/fire/firestore';
import { CostumeModel } from '../interfaces/costume.model'; // Usamos el nombre corregido
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

// --- Conversor de Firestore (Corregido) ---
const costumeConverter: FirestoreDataConverter<CostumeModel> = {
  // toFirestore: Se llama cuando usamos setDoc() o addDoc()
  toFirestore(costume: WithFieldValue<CostumeModel>): DocumentData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = costume; // Excluimos el 'id' al guardar
    return data;
  },
  
  // fromFirestore: Se llama cuando leemos datos (como en collectionData)
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CostumeModel {
    const data = snapshot.data(options)!; 
    // Creamos y devolvemos un objeto CostumeModel completo
    return {
      id: snapshot.id, // Obtenemos el ID del snapshot
      name: data['name'],
      region: data['region'],
      price: data['price'],
      image: data['image'],
      sizes: data['sizes'],
      description: data['description']
    } as CostumeModel; // Aseguramos el tipo
  }
};
// --- Fin Conversor ---


@Injectable({
  providedIn: 'root'
})
export class Costume { // <-- Nuestra clase de servicio

  #firestore: Firestore = inject(Firestore);

  // --- CORRECCIÓN 1: Inicialización Directa ---
  // Inicializamos la referencia a la colección directamente aquí,
  // aplicando el conversor de inmediato.
  #costumesCollection: CollectionReference<CostumeModel> = collection(this.#firestore, 'costumes')
      .withConverter(costumeConverter); 

  // Ya NO necesitamos el constructor para esto
  // constructor() { }

  // --- Obtener Todos los Disfraces ---
  // Ahora, cuando se lee costumes$, #costumesCollection YA está inicializada.
  readonly costumes$ = collectionData(this.#costumesCollection) as Observable<CostumeModel[]>;
  readonly costumes = toSignal(this.costumes$, { initialValue: [] });

  // --- Operaciones CRUD ---

  /**
   * Agrega un nuevo disfraz a la colección 'costumes'
   * @param costumeData Datos del disfraz (sin el ID, Firestore lo genera)
   */
  addCostume(costumeData: Omit<CostumeModel, 'id'>) {
    // addDoc usará la referencia con conversor (#costumesCollection)
    // y aplicará toFirestore automáticamente.
    // El conversor espera un tipo CostumeModel, pero addDoc infiere Omit<CostumeModel, 'id'>.
    // Le pasamos los datos y forzamos el tipo que espera el conversor.
    return addDoc(this.#costumesCollection, costumeData as CostumeModel);
  }

  /**
   * Elimina un disfraz de la colección por su ID
   * @param costumeId ID del documento a eliminar
   */
  deleteCostume(costumeId: string) {
    // deleteDoc no usa el conversor, solo necesita la ruta
    const costumeDocRef = doc(this.#firestore, `costumes/${costumeId}`);
    return deleteDoc(costumeDocRef);
  }

  /**
   * Actualiza un disfraz existente en la colección
   * @param costumeId ID del documento a actualizar
   * @param updatedData Datos parciales a actualizar
   */
  updateCostume(costumeId: string, updatedData: Partial<Omit<CostumeModel, 'id'>>) {
    // updateDoc tampoco usa el conversor, solo la ruta y datos parciales
    const costumeDocRef = doc(this.#firestore, `costumes/${costumeId}`);
    return updateDoc(costumeDocRef, updatedData);
  }
}