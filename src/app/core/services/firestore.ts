// // src/app/core/services/firestore.ts

// import { Injectable, computed, inject, signal } from '@angular/core';
// import { Firestore as FirebaseFirestore, collection, collectionData, DocumentData, addDoc, updateDoc, doc, deleteDoc } from '@angular/fire/firestore'; // <-- Añade deleteDoc
// import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage'; // <-- Añade deleteObject
// import { toSignal } from '@angular/core/rxjs-interop';
// import { Costume } from '../models/costume';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class Firestore {
//   private firestore: FirebaseFirestore = inject(FirebaseFirestore);
//   private storage: Storage = inject(Storage);

//   private costumesCollection = collection(this.firestore, 'costumes');
//   private costumes$ = collectionData(this.costumesCollection, { idField: 'id' }) as Observable<Costume[]>;

//   public costumes = toSignal(this.costumes$, { initialValue: [] });
//   public regionFilter = signal<'Todos' | 'Costa' | 'Sierra' | 'Selva'>('Todos');
//   public sizeFilter = signal<'Todos' | 'S' | 'M' | 'L' | 'XL'>('Todos');

//   public filteredCostumes = computed(() => {
//     // ... (lógica de filtrado existente) ...
//     const costumes = this.costumes();
//     const region = this.regionFilter();
//     const size = this.sizeFilter();

//     return costumes.filter(costume => {
//       const regionMatch = (region === 'Todos') || (costume.region === region);
//       const sizeMatch = (size === 'Todos') || (costume.sizes.includes(size));
//       return regionMatch && sizeMatch;
//     });
//   });

//   // --- SUBIDA DE IMAGEN (Función Helper Privada) ---
//   private async uploadImage(imageFile: File, costumeName: string): Promise<string> {
//     // Crea un nombre único para el archivo (ej. marinera-nortena-1678886400000.jpg)
//     const fileName = `${costumeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${imageFile.name.split('.').pop()}`;
//     // Crea una referencia a la ubicación en Storage (ej. 'costume-images/marinera...')
//     const storageRef = ref(this.storage, `costume-images/${fileName}`);
//     // Sube el archivo
//     const uploadResult = await uploadBytes(storageRef, imageFile);
//     // Obtiene la URL pública de descarga
//     const downloadURL = await getDownloadURL(uploadResult.ref);
//     return downloadURL;
//   }

//   // --- SECCIÓN CRUD (Implementada) ---

//   async addCostume(costumeData: Partial<Costume>, imageFile?: File): Promise<void> {
//     if (!imageFile) {
//       throw new Error("La imagen es obligatoria para nuevos disfraces.");
//     }
//     if (!costumeData.name) {
//        throw new Error("El nombre es obligatorio para subir la imagen.");
//     }

//     try {
//       // 1. Sube la imagen y obtén la URL
//       const imageUrl = await this.uploadImage(imageFile, costumeData.name);

//       // 2. Prepara el objeto completo para Firestore (incluyendo la URL)
//       const finalCostumeData = {
//         ...costumeData, // Incluye name, region, price, etc.
//         image: imageUrl   // Asigna la URL obtenida
//       };

//       // 3. Añade el documento a la colección 'costumes'
//       await addDoc(this.costumesCollection, finalCostumeData);

//     } catch (error) {
//       console.error("Error al añadir disfraz:", error);
//       // Podríamos intentar borrar la imagen si se subió pero falló Firestore
//       throw error; // Re-lanza el error para que el componente lo maneje
//     }
//   }

//   async updateCostume(id: string, costumeData: Partial<Costume>, imageFile?: File): Promise<void> {
//      if (!id) throw new Error("ID del disfraz es requerido para actualizar.");
     
//      let imageUrl = costumeData.image; // Mantiene la URL existente por defecto

//      try {
//        // Si se proporcionó un NUEVO archivo de imagen...
//        if (imageFile) {
//           if (!costumeData.name) throw new Error("El nombre es necesario para nombrar la imagen.");
//          // TODO: Opcionalmente, podríamos borrar la imagen antigua de Storage aquí
//          // const oldImageUrl = ... (necesitaríamos obtenerla primero)
//          // if (oldImageUrl) { try { await deleteObject(ref(this.storage, oldImageUrl)); } catch(e){ console.warn("No se pudo borrar imagen antigua", e)} }

//          // Sube la nueva imagen y obtén su URL
//          imageUrl = await this.uploadImage(imageFile, costumeData.name);
//        }

//        // Prepara los datos finales para actualizar
//        const finalCostumeData = {
//          ...costumeData,
//          image: imageUrl // Usa la nueva URL o la existente
//        };

//        // Obtiene la referencia al documento existente
//        const costumeDocRef = doc(this.firestore, 'costumes', id);
//        // Actualiza el documento
//        await updateDoc(costumeDocRef, finalCostumeData);

//      } catch (error) {
//        console.error("Error al actualizar disfraz:", error);
//        // Podríamos tener lógica de rollback si la subida falla después de borrar la vieja, etc.
//        throw error;
//      }
//   }

//   async deleteCostume(id: string): Promise<void> {
//     if (!id) throw new Error("ID del disfraz es requerido para eliminar.");

//     try {
//       // TODO: Opcionalmente, obtener la URL de la imagen y borrarla de Storage
//       // const costumeToDelete = this.costumes().find(c => c.id === id);
//       // if (costumeToDelete?.image) {
//       //   try { await deleteObject(ref(this.storage, costumeToDelete.image)); } catch (e) { console.warn("No se pudo borrar imagen", e)}
//       // }

//       // Obtiene la referencia al documento
//       const costumeDocRef = doc(this.firestore, 'costumes', id);
//       // Borra el documento
//       await deleteDoc(costumeDocRef);

//     } catch (error) {
//       console.error("Error al eliminar disfraz:", error);
//       throw error;
//     }
//   }


//   // --- Métodos de Filtro ---
//   setRegionFilter(region: 'Todos' | 'Costa' | 'Sierra' | 'Selva') {
//     this.regionFilter.set(region);
//   }

//   setSizeFilter(size: 'Todos' | 'S' | 'M' | 'L' | 'XL') {
//     this.sizeFilter.set(size);
//   }
// }

//------------------------------------------------------------------------

// src/app/core/services/firestore.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Firestore as FirebaseFirestore, collection, collectionData, DocumentData, addDoc, updateDoc, doc, deleteDoc, writeBatch, getDocs, query, where, getDoc, setDoc } from '@angular/fire/firestore'; // <-- Añade getDoc
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { Costume } from '../models/costume';
import { Banner } from '../models/banner'; // <-- Importa Banner
import { Observable } from 'rxjs';

// Nombre de la colección para guardar el ID del banner activo
const ACTIVE_BANNER_CONFIG_COLLECTION = 'config';
const ACTIVE_BANNER_DOC_ID = 'activeBanner';

@Injectable({
  providedIn: 'root'
})
export class Firestore {
  private firestore: FirebaseFirestore = inject(FirebaseFirestore);
  private storage: Storage = inject(Storage);

  // --- COLECCIONES ---
  private costumesCollection = collection(this.firestore, 'costumes');
  private bannersCollection = collection(this.firestore, 'banners'); // <-- Colección Banners
  private configCollection = collection(this.firestore, ACTIVE_BANNER_CONFIG_COLLECTION); // Colección Config

  // --- OBSERVABLES ---
  private costumes$ = collectionData(this.costumesCollection, { idField: 'id' }) as Observable<Costume[]>;
  private banners$ = collectionData(this.bannersCollection, { idField: 'id' }) as Observable<Banner[]>; // <-- Observable Banners

  // --- SIGNALS ---
  // Disfraces
  public costumes = toSignal(this.costumes$, { initialValue: [] });
  public regionFilter = signal<'Todos' | 'Costa' | 'Sierra' | 'Selva'>('Todos');
  public sizeFilter = signal<'Todos' | 'S' | 'M' | 'L' | 'XL'>('Todos');
  public filteredCostumes = computed(() => { /* ... lógica filtro disfraces ... */
    const costumes = this.costumes();
    const region = this.regionFilter();
    const size = this.sizeFilter();
    return costumes.filter(costume => {
      const regionMatch = (region === 'Todos') || (costume.region === region);
      const sizeMatch = (size === 'Todos') || (costume.sizes.includes(size));
      return regionMatch && sizeMatch;
    });
  });

  // Banners
  public banners = toSignal(this.banners$, { initialValue: [] }); // <-- Signal Banners
  public activeBannerId = signal<string | null>(null); // <-- Signal para ID activo

  constructor() {
    this.loadActiveBannerId(); // Carga el ID activo al iniciar
  }

  // --- Métodos Helpers Imagen (sin cambios) ---
  private async uploadImage(imageFile: File, name: string): Promise<string> { /* ...código existente... */
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${imageFile.name.split('.').pop()}`;
      const storageRef = ref(this.storage, `banner-images/${fileName}`); // Carpeta diferente para banners?
      console.log(`Subiendo imagen a: ${storageRef.fullPath}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log(`Imagen subida, URL: ${downloadURL}`);
      return downloadURL;
   }
  private async deleteImage(imageUrl: string): Promise<void> { /* ...código existente... */
    if (!imageUrl || imageUrl.startsWith('https://placehold.co')) {
        console.log("No se borra imagen de placeholder o URL inválida.");
        return;
    }
    try {
      const imageRef = ref(this.storage, imageUrl);
      console.log(`Intentando borrar imagen: ${imageUrl}`);
      await deleteObject(imageRef);
      console.log(`Imagen borrada exitosamente.`);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(`La imagen ${imageUrl} no se encontró en Storage.`);
      } else {
        console.error("Error al borrar imagen de Storage:", error);
      }
    }
   }

  // --- MÉTODOS CRUD DISFRACES (sin cambios) ---
  async addCostume(costumeData: Partial<Costume>, imageFile?: File): Promise<void> { /* ...código existente... */ }
  async updateCostume(id: string, costumeData: Partial<Costume>, imageFile?: File): Promise<void> { /* ...código existente... */ }
  async deleteCostume(id: string): Promise<void> { /* ...código existente... */ }

  // --- 👇 NUEVOS MÉTODOS CRUD BANNERS ---

  async addBanner(bannerData: Partial<Banner>, imageFile?: File): Promise<void> {
    if (!imageFile) throw new Error("La imagen es obligatoria para nuevos banners.");
    if (!bannerData.title) throw new Error("El título es obligatorio para subir la imagen.");

    let imageUrl = '';
    try {
      imageUrl = await this.uploadImage(imageFile, bannerData.title); // Usar título para nombre
      const finalBannerData: Omit<Banner, 'id'> = {
        festivity: bannerData.festivity || 'General',
        title: bannerData.title,
        subtitle: bannerData.subtitle || '',
        buttonText: bannerData.buttonText || 'Ver más',
        image: imageUrl
      };
      const docRef = await addDoc(this.bannersCollection, finalBannerData);
      console.log("Banner añadido con ID: ", docRef.id);
      // Opcional: ¿Hacer este el activo por defecto?
      // if (this.banners().length === 1) await this.setActiveBanner(docRef.id);
    } catch (error) {
      console.error("Error al añadir banner:", error);
      if (imageUrl) await this.deleteImage(imageUrl);
      throw error;
    }
  }

  async updateBanner(id: string, bannerData: Partial<Banner>, imageFile?: File): Promise<void> {
    if (!id) throw new Error("ID del banner es requerido para actualizar.");
    const bannerToUpdate = this.banners().find(b => b.id === id);
    let newImageUrl = bannerData.image;
    let oldImageUrl = bannerToUpdate?.image;

    try {
      if (imageFile) {
        if (!bannerData.title) throw new Error("El título es necesario para nombrar la imagen.");
        newImageUrl = await this.uploadImage(imageFile, bannerData.title);
        console.log("Nueva imagen de banner subida:", newImageUrl);
      }

      const finalBannerData = { // Asegurar todas las props
        festivity: bannerData.festivity ?? bannerToUpdate?.festivity ?? 'General',
        title: bannerData.title ?? bannerToUpdate?.title ?? '',
        subtitle: bannerData.subtitle ?? bannerToUpdate?.subtitle ?? '',
        buttonText: bannerData.buttonText ?? bannerToUpdate?.buttonText ?? 'Ver más',
        image: newImageUrl ?? bannerToUpdate?.image // Usa nueva URL o la existente
      };

      const bannerDocRef = doc(this.firestore, 'banners', id);
      await updateDoc(bannerDocRef, finalBannerData);
      console.log("Banner actualizado con ID:", id);

      if (imageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
         console.log("Borrando imagen antigua del banner...");
         await this.deleteImage(oldImageUrl);
      }
    } catch (error) {
       console.error("Error al actualizar banner:", error);
       if (imageFile && newImageUrl && newImageUrl !== oldImageUrl) {
         await this.deleteImage(newImageUrl);
       }
       throw error;
    }
  }

  async deleteBanner(id: string): Promise<void> {
    if (!id) throw new Error("ID del banner es requerido para eliminar.");
    const bannerToDelete = this.banners().find(b => b.id === id);

    // Si el banner a borrar es el activo, desactívalo primero
    if (this.activeBannerId() === id) {
       await this.setActiveBanner(null);
    }

    try {
      const bannerDocRef = doc(this.firestore, 'banners', id);
      await deleteDoc(bannerDocRef);
      console.log("Documento de banner eliminado:", id);

      if (bannerToDelete?.image) {
        await this.deleteImage(bannerToDelete.image);
      }
    } catch (error) {
      console.error("Error al eliminar banner:", error);
      throw error;
    }
  }

  // --- 👇 NUEVOS MÉTODOS PARA BANNER ACTIVO ---

  // Carga el ID del banner activo desde Firestore al iniciar
  private async loadActiveBannerId(): Promise<void> {
     try {
       const docRef = doc(this.configCollection, ACTIVE_BANNER_DOC_ID);
       const docSnap = await getDoc(docRef);
       if (docSnap.exists()) {
         this.activeBannerId.set(docSnap.data()?.['activeId'] || null);
         console.log("ID de banner activo cargado:", this.activeBannerId());
       } else {
         this.activeBannerId.set(null); // No hay config guardada
         console.log("No se encontró configuración de banner activo.");
       }
     } catch (error) {
       console.error("Error cargando banner activo:", error);
       this.activeBannerId.set(null);
     }
  }

  // Guarda el ID del banner activo en Firestore
  async setActiveBanner(id: string | null): Promise<void> {
    try {
      const docRef = doc(this.configCollection, ACTIVE_BANNER_DOC_ID);
      // Usamos set con merge:true para crear/actualizar el documento
      await setDoc(docRef, { activeId: id }, { merge: true }); // <-- Necesita import 'setDoc'
      this.activeBannerId.set(id); // Actualiza el signal local
      console.log("Banner activo guardado:", id);
    } catch (error) {
      console.error("Error guardando banner activo:", error);
      throw error;
    }
  }
  // Importa setDoc:
  // import { ... setDoc } from '@angular/fire/firestore';


  // --- Métodos de Filtro Disfraces (sin cambios) ---
  setRegionFilter(region: 'Todos' | 'Costa' | 'Sierra' | 'Selva') { /* ... */ }
  setSizeFilter(size: 'Todos' | 'S' | 'M' | 'L' | 'XL') { /* ... */ }
}