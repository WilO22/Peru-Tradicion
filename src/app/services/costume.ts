// src/app/services/costume.ts

import { Injectable, inject, signal, computed, Signal } from '@angular/core'; 
import { 
  Firestore, 
  collection, 
  collectionData, 
  // ... (otros imports de firestore)
  doc, addDoc, deleteDoc, updateDoc, CollectionReference,
  FirestoreDataConverter, DocumentData, QueryDocumentSnapshot,
  SnapshotOptions, WithFieldValue
} from '@angular/fire/firestore';
import { CostumeModel, CostumeRegion, CostumeSize } from '../interfaces/costume.model';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

// --- El Conversor de Firestore (Sin cambios) ---
const costumeConverter: FirestoreDataConverter<CostumeModel> = {
  toFirestore(costume: WithFieldValue<CostumeModel>): DocumentData {
    const { id, ...data } = costume;
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CostumeModel {
    const data = snapshot.data(options)!; 
    return {
      id: snapshot.id,
      ...data
    } as CostumeModel; 
  }
};
// --- Fin Conversor ---

@Injectable({
  providedIn: 'root'
})
export class Costume { 
  
  #firestore: Firestore = inject(Firestore);
  
  // --- SECCIÓN DE ESTADO ---

  readonly #selectedRegion = signal<CostumeRegion | 'Todos'>('Todos');
  readonly #selectedSize = signal<CostumeSize | 'Todos'>('Todos');
  
  readonly #costumesCollection: CollectionReference<CostumeModel>; 

  // ↓↓↓ CORRECCIÓN 1: Hacemos pública la lista COMPLETA ↓↓↓
  // (Quitamos el '#' de '#allCostumes')
  readonly allCostumes: Signal<CostumeModel[]>; // Este es el Signal con TODOS los disfraces

  // 3. Estado Derivado (Público)
  readonly filteredCostumes: Signal<CostumeModel[]>; // Para la página 'Home'

  // 4. Exponemos los signals de solo lectura para la UI
  public readonly selectedRegion = this.#selectedRegion.asReadonly();
  public readonly selectedSize = this.#selectedSize.asReadonly();

  constructor() {
    this.#costumesCollection = collection(this.#firestore, 'costumes')
        .withConverter(costumeConverter); 
    
    const costumes$ = collectionData(this.#costumesCollection) as Observable<CostumeModel[]>;
    // ↓↓↓ CORRECCIÓN 2: Asignamos al Signal público 'allCostumes' ↓↓↓
    this.allCostumes = toSignal(costumes$, { initialValue: [] });

    // 'computed' ahora usa el Signal público 'allCostumes'
    this.filteredCostumes = computed(() => {
      // ↓↓↓ CORRECCIÓN 3: Leemos de 'this.allCostumes()' ↓↓↓
      const costumes = this.allCostumes();
      const region = this.#selectedRegion();
      const size = this.#selectedSize();

      return costumes
        .filter(c => region === 'Todos' || c.region === region)
        .filter(c => size === 'Todos' || c.sizes.includes(size));
    });
  }

  // --- MÉTODOS PÚBLICOS (sin cambios) ---
  changeRegion(region: CostumeRegion | 'Todos') {
    this.#selectedRegion.set(region);
  }

  changeSize(size: CostumeSize | 'Todos') {
    this.#selectedSize.set(size);
  }

  // --- MÉTODOS CRUD (sin cambios) ---
  addCostume(costumeData: Omit<CostumeModel, 'id'>) {
    return addDoc(this.#costumesCollection, costumeData as CostumeModel);
  }
  // ... (deleteCostume y updateCostume se quedan igual)
  deleteCostume(costumeId: string) {
    const costumeDocRef = doc(this.#firestore, `costumes/${costumeId}`);
    return deleteDoc(costumeDocRef);
  }

  updateCostume(costumeId: string, updatedData: Partial<Omit<CostumeModel, 'id'>>) {
    const costumeDocRef = doc(this.#firestore, `costumes/${costumeId}`);
    return updateDoc(costumeDocRef, updatedData);
  }
}