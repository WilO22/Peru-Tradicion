// src/app/core/services/firestore.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Firestore as FirebaseFirestore, collection, collectionData, DocumentData, addDoc, updateDoc, doc, deleteDoc } from '@angular/fire/firestore'; // <-- Añade deleteDoc
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage'; // <-- Añade deleteObject
import { toSignal } from '@angular/core/rxjs-interop';
import { Costume } from '../models/costume';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Firestore {
  private firestore: FirebaseFirestore = inject(FirebaseFirestore);
  private storage: Storage = inject(Storage);

  private costumesCollection = collection(this.firestore, 'costumes');
  private costumes$ = collectionData(this.costumesCollection, { idField: 'id' }) as Observable<Costume[]>;

  public costumes = toSignal(this.costumes$, { initialValue: [] });
  public regionFilter = signal<'Todos' | 'Costa' | 'Sierra' | 'Selva'>('Todos');
  public sizeFilter = signal<'Todos' | 'S' | 'M' | 'L' | 'XL'>('Todos');

  public filteredCostumes = computed(() => {
    // ... (lógica de filtrado existente) ...
    const costumes = this.costumes();
    const region = this.regionFilter();
    const size = this.sizeFilter();

    return costumes.filter(costume => {
      const regionMatch = (region === 'Todos') || (costume.region === region);
      const sizeMatch = (size === 'Todos') || (costume.sizes.includes(size));
      return regionMatch && sizeMatch;
    });
  });

  // --- SUBIDA DE IMAGEN (Función Helper Privada) ---
  private async uploadImage(imageFile: File, costumeName: string): Promise<string> {
    // Crea un nombre único para el archivo (ej. marinera-nortena-1678886400000.jpg)
    const fileName = `${costumeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${imageFile.name.split('.').pop()}`;
    // Crea una referencia a la ubicación en Storage (ej. 'costume-images/marinera...')
    const storageRef = ref(this.storage, `costume-images/${fileName}`);
    // Sube el archivo
    const uploadResult = await uploadBytes(storageRef, imageFile);
    // Obtiene la URL pública de descarga
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  }

  // --- SECCIÓN CRUD (Implementada) ---

  async addCostume(costumeData: Partial<Costume>, imageFile?: File): Promise<void> {
    if (!imageFile) {
      throw new Error("La imagen es obligatoria para nuevos disfraces.");
    }
    if (!costumeData.name) {
       throw new Error("El nombre es obligatorio para subir la imagen.");
    }

    try {
      // 1. Sube la imagen y obtén la URL
      const imageUrl = await this.uploadImage(imageFile, costumeData.name);

      // 2. Prepara el objeto completo para Firestore (incluyendo la URL)
      const finalCostumeData = {
        ...costumeData, // Incluye name, region, price, etc.
        image: imageUrl   // Asigna la URL obtenida
      };

      // 3. Añade el documento a la colección 'costumes'
      await addDoc(this.costumesCollection, finalCostumeData);

    } catch (error) {
      console.error("Error al añadir disfraz:", error);
      // Podríamos intentar borrar la imagen si se subió pero falló Firestore
      throw error; // Re-lanza el error para que el componente lo maneje
    }
  }

  async updateCostume(id: string, costumeData: Partial<Costume>, imageFile?: File): Promise<void> {
     if (!id) throw new Error("ID del disfraz es requerido para actualizar.");
     
     let imageUrl = costumeData.image; // Mantiene la URL existente por defecto

     try {
       // Si se proporcionó un NUEVO archivo de imagen...
       if (imageFile) {
          if (!costumeData.name) throw new Error("El nombre es necesario para nombrar la imagen.");
         // TODO: Opcionalmente, podríamos borrar la imagen antigua de Storage aquí
         // const oldImageUrl = ... (necesitaríamos obtenerla primero)
         // if (oldImageUrl) { try { await deleteObject(ref(this.storage, oldImageUrl)); } catch(e){ console.warn("No se pudo borrar imagen antigua", e)} }

         // Sube la nueva imagen y obtén su URL
         imageUrl = await this.uploadImage(imageFile, costumeData.name);
       }

       // Prepara los datos finales para actualizar
       const finalCostumeData = {
         ...costumeData,
         image: imageUrl // Usa la nueva URL o la existente
       };

       // Obtiene la referencia al documento existente
       const costumeDocRef = doc(this.firestore, 'costumes', id);
       // Actualiza el documento
       await updateDoc(costumeDocRef, finalCostumeData);

     } catch (error) {
       console.error("Error al actualizar disfraz:", error);
       // Podríamos tener lógica de rollback si la subida falla después de borrar la vieja, etc.
       throw error;
     }
  }

  async deleteCostume(id: string): Promise<void> {
    if (!id) throw new Error("ID del disfraz es requerido para eliminar.");

    try {
      // TODO: Opcionalmente, obtener la URL de la imagen y borrarla de Storage
      // const costumeToDelete = this.costumes().find(c => c.id === id);
      // if (costumeToDelete?.image) {
      //   try { await deleteObject(ref(this.storage, costumeToDelete.image)); } catch (e) { console.warn("No se pudo borrar imagen", e)}
      // }

      // Obtiene la referencia al documento
      const costumeDocRef = doc(this.firestore, 'costumes', id);
      // Borra el documento
      await deleteDoc(costumeDocRef);

    } catch (error) {
      console.error("Error al eliminar disfraz:", error);
      throw error;
    }
  }


  // --- Métodos de Filtro ---
  setRegionFilter(region: 'Todos' | 'Costa' | 'Sierra' | 'Selva') {
    this.regionFilter.set(region);
  }

  setSizeFilter(size: 'Todos' | 'S' | 'M' | 'L' | 'XL') {
    this.sizeFilter.set(size);
  }
}