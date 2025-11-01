// src/app/services/banner.ts
import { Injectable, inject, computed } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  limit,
  // --- 1. Importar métodos CRUD y de Transacción ---
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch, // <-- ¡Importante para 'activar'!
  // ---
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
  getDocs, // <-- ¡Importante para 'activar'!
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { BannerModel } from '../interfaces/banner.model';

// --- Principio: Tipado Estricto con Convertidor ---
// Le enseñamos a Firestore cómo convertir datos 'BannerModel'
const bannerConverter: FirestoreDataConverter<BannerModel> = {
  toFirestore(banner: BannerModel): DocumentData {
    // Al guardar, quitamos el 'id' ya que es el ID del documento
    const { id, ...data } = banner; 
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): BannerModel {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      ...data,
    } as BannerModel;
  },
};
// --- Fin del Convertidor ---

@Injectable({
  providedIn: 'root',
})
export class Banner {
#firestore: Firestore = inject(Firestore);

  #bannersCollection = collection(this.#firestore, 'banners').withConverter(
    bannerConverter
  );

  // --- Lógica de LECTURA (del Módulo 2, sin cambios) ---

  #activeBannerQuery = query(
    this.#bannersCollection,
    where('isActive', '==', true),
    limit(1)
  );
  #activeBanner$ = collectionData(this.#activeBannerQuery) as Observable<
    BannerModel[]
  >;
  #activeBanners = toSignal(this.#activeBanner$, { initialValue: [] });
  public readonly activeBanner = computed(() => this.#activeBanners()[0] ?? null);

  // --- ¡NUEVO! Lógica de LECTURA DE TODOS los Banners (para el Admin) ---
  #allBannersQuery = query(this.#bannersCollection); // Query sin filtros
  #allBanners$ = collectionData(this.#allBannersQuery) as Observable<
    BannerModel[]
  >;
  // Signal público para la tabla de admin
  public readonly allBanners = toSignal(this.#allBanners$, { initialValue: [] });

  constructor() {}

  // --- ¡NUEVO! Métodos CRUD ---

  addBanner(bannerData: Omit<BannerModel, 'id'>) {
    // Si es el primer banner, lo activamos por defecto
    const dataToSave = this.allBanners().length === 0 
      ? { ...bannerData, isActive: true } 
      : bannerData;
    return addDoc(this.#bannersCollection, dataToSave as BannerModel);
  }

  updateBanner(bannerId: string, updatedData: Partial<Omit<BannerModel, 'id'>>) {
    const bannerDocRef = doc(this.#firestore, `banners/${bannerId}`);
    return updateDoc(bannerDocRef, updatedData);
  }

  deleteBanner(bannerId: string) {
    const bannerDocRef = doc(this.#firestore, `banners/${bannerId}`);
    return deleteDoc(bannerDocRef);
  }

  // --- ¡NUEVO! Método de Activación (Transaccional) ---

  /**
   * Activa un banner específico y desactiva todos los demás.
   * Esto usa un 'Batch Write' para asegurar que la operación sea atómica.
   */
  async setActiveBanner(bannerToActivate: BannerModel) {
    // 1. Crear un 'batch' (lote de escrituras)
    const batch = writeBatch(this.#firestore);

    // 2. Obtener una instantánea de TODOS los banners
    const allBannersSnapshot = await getDocs(this.#allBannersQuery);

    // 3. Iterar y desactivar los que estén activos
    allBannersSnapshot.forEach((document) => {
      if (document.data().isActive === true) {
        batch.update(document.ref, { isActive: false });
      }
    });

    // 4. Activar el banner seleccionado
    const newActiveRef = doc(this.#firestore, `banners/${bannerToActivate.id}`);
    batch.update(newActiveRef, { isActive: true });

    // 5. Ejecutar todas las operaciones del lote a la vez
    return batch.commit();
  }
}