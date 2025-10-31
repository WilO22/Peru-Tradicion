// src/app/services/banner.ts
import { Injectable, inject, computed } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
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

  // 1. Creamos una referencia a la colección CON el convertidor
  #bannersCollection = collection(this.#firestore, 'banners').withConverter(
    bannerConverter
  );

  // 2. Creamos un query para pedir SÓLO el banner activo
  #activeBannerQuery = query(
    this.#bannersCollection,
    where('isActive', '==', true), // Filtramos por el campo 'isActive'
    limit(1) // Solo queremos uno
  );

  // 3. Creamos el Observable que escucha cambios en ese query
  #activeBanner$ = collectionData(this.#activeBannerQuery) as Observable<BannerModel[]>;

  // 4. Convertimos el stream a un Signal
  #activeBanners = toSignal(this.#activeBanner$, { initialValue: [] });

  // 5. Usamos 'computed' para exponer SÓLO el primer banner, o null
  public readonly activeBanner = computed(() => this.#activeBanners()[0] ?? null);

  constructor() {}

  // Dejaremos los métodos CRUD (add, update, delete) para el Módulo 5
}