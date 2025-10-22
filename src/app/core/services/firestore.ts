// src/app/core/services/firestore.ts

import { Injectable, computed, inject, signal } from '@angular/core';
// Usamos el alias 'FirebaseFirestore' para evitar colisión de nombres
import { Firestore as FirebaseFirestore, collection, collectionData, DocumentData } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Costume } from '../models/costume'; // <-- Apunta al archivo 'costume.ts'
import { Observable } from 'rxjs'; // <-- Importa Observable

@Injectable({
  providedIn: 'root'
})
export class Firestore { // <-- Nombre de clase 'Firestore'

  // Inyectamos el servicio de base de datos de Firebase
  private firestore: FirebaseFirestore = inject(FirebaseFirestore);

  // --- SECCIÓN DE ESTADO (NUESTRO STORE CON SIGNALS) ---

  // 1. EL ESTADO "RAW" (CRUDO)
  // Obtenemos la colección 'costumes' de Firestore.
  private costumesCollection = collection(this.firestore, 'costumes');

  // 'collectionData' nos da un Observable que emite la lista de disfraces
  // cada vez que hay un cambio en la base de datos (¡tiempo real!).
  private costumes$ = collectionData(this.costumesCollection, { idField: 'id' }) as Observable<Costume[]>;

  // Convertimos el Observable (stream) en un Signal (valor reactivo).
  public costumes = toSignal(this.costumes$, { initialValue: [] });

  // 2. LOS FILTROS
  // Creamos Signals para guardar la selección actual del usuario
  public regionFilter = signal<'Todos' | 'Costa' | 'Sierra' | 'Selva'>('Todos');
  public sizeFilter = signal<'Todos' | 'S' | 'M' | 'L' | 'XL'>('Todos');

  // 3. EL ESTADO "DERIVADO" (COMPUTADO)
  // Esta función se re-ejecutará *automáticamente* cada vez que
  // 'costumes', 'regionFilter', o 'sizeFilter' cambien.
  public filteredCostumes = computed(() => {
    const costumes = this.costumes(); // Obtenemos el valor actual de los Signals
    const region = this.regionFilter();
    const size = this.sizeFilter();

    // Aplicamos los filtros
    return costumes.filter(costume => {
      const regionMatch = (region === 'Todos') || (costume.region === region);
      const sizeMatch = (size === 'Todos') || (costume.sizes.includes(size));
      return regionMatch && sizeMatch;
    });
  });

  // --- SECCIÓN DE MÉTODOS (Acciones para mutar el estado) ---

  // Métodos simples para que los componentes actualicen los filtros
  setRegionFilter(region: 'Todos' | 'Costa' | 'Sierra' | 'Selva') {
    this.regionFilter.set(region);
  }

  setSizeFilter(size: 'Todos' | 'S' | 'M' | 'L' | 'XL') {
    this.sizeFilter.set(size);
  }
}