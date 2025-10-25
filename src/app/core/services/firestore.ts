// src/app/core/services/firestore.ts

import { Injectable, computed, inject, signal } from '@angular/core';
// Importa las funciones necesarias de Firestore y Storage
import {
  Firestore as FirebaseFirestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc, // Necesario para setActiveBanner
  addDoc,
  updateDoc,
  deleteDoc,
  docData, // Necesario para banner activo en tiempo real
  DocumentData,
  writeBatch, // No usado actualmente, pero puede ser útil para operaciones por lotes
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
// Importa funciones de interoperabilidad RxJS <-> Signals
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { Costume } from '../models/costume'; // Asegúrate que la ruta sea correcta
import { Banner } from '../models/banner';   // Asegúrate que la ruta sea correcta
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators'; // Necesario para procesar docData

// Constantes para la configuración del banner activo
const ACTIVE_BANNER_CONFIG_COLLECTION = 'config';
const ACTIVE_BANNER_DOC_ID = 'activeBanner';

@Injectable({
  providedIn: 'root'
})
export class Firestore { // Nombre de clase sin sufijo 'Service'
  // Inyección de dependencias moderna
  private firestore: FirebaseFirestore = inject(FirebaseFirestore);
  private storage: Storage = inject(Storage);

  // --- COLECCIONES ---
  private costumesCollection = collection(this.firestore, 'costumes');
  private bannersCollection = collection(this.firestore, 'banners');
  private configCollection = collection(this.firestore, ACTIVE_BANNER_CONFIG_COLLECTION);
  // Referencia al documento de configuración del banner activo
  private activeBannerConfigDocRef = doc(this.configCollection, ACTIVE_BANNER_DOC_ID);


  // --- OBSERVABLES (Fuentes de datos en tiempo real) ---
  private costumes$ = collectionData(this.costumesCollection, { idField: 'id' }) as Observable<Costume[]>;
  private banners$ = collectionData(this.bannersCollection, { idField: 'id' }) as Observable<Banner[]>;

  // Observable para el ID activo (TIEMPO REAL)
  private activeBannerId$: Observable<string | null> = docData(this.activeBannerConfigDocRef).pipe(
    map(configDoc => configDoc?.['activeId'] as string | null ?? null), // Extrae 'activeId' o devuelve null
    shareReplay(1) // Comparte la última emisión con nuevos suscriptores
  );


  // --- SIGNALS (Estado reactivo de la aplicación) ---

  // Estado de Disfraces
  public costumes = toSignal(this.costumes$, { initialValue: [] });
  public regionFilter = signal<'Todos' | 'Costa' | 'Sierra' | 'Selva'>('Todos');
  public sizeFilter = signal<'Todos' | 'S' | 'M' | 'L' | 'XL'>('Todos');
  // Signal Computado: Filtra disfraces basado en los signals de filtro
  public filteredCostumes = computed(() => {
    const costumes = this.costumes();
    const region = this.regionFilter();
    const size = this.sizeFilter();
    // console.log(`Filtrando disfraces: Region=${region}, Talla=${size}`); // Log para depuración
    return costumes.filter(costume => {
      const regionMatch = (region === 'Todos') || (costume.region === region);
      const sizeMatch = (size === 'Todos') || (costume.sizes.includes(size));
      return regionMatch && sizeMatch;
    });
  });

  // Estado de Banners
  public banners = toSignal(this.banners$, { initialValue: [] });
  // Signal para ID activo, derivado del Observable en tiempo real
  public activeBannerId = toSignal(this.activeBannerId$, { initialValue: null });
  // Signal Computado: Encuentra el objeto Banner completo que está activo (reactivo en tiempo real)
  public activeBanner = computed(() => {
    const banners = this.banners();
    const activeId = this.activeBannerId();
    // console.log(`Calculando banner activo: ActiveID=${activeId}, Total Banners=${banners.length}`); // Log para depuración
    if (!activeId || banners.length === 0) {
      return null;
    }
    const foundBanner = banners.find(banner => banner.id === activeId);
    return foundBanner || null;
  });

  // --- CONSTRUCTOR ---
  constructor() {
    // El observable activeBannerId$ se activa automáticamente al ser usado por toSignal
    console.log("Servicio Firestore inicializado. Escuchando banner activo...");
  }

  // --- MÉTODOS HELPERS (Privados) ---

  // Sube una imagen a Firebase Storage
  private async uploadImage(imageFile: File, name: string, folder: 'costume-images' | 'banner-images'): Promise<string> {
    const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${imageFile.name.split('.').pop()}`;
    const storageRef = ref(this.storage, `${folder}/${fileName}`);
    console.log(`Subiendo imagen a: ${storageRef.fullPath}`);
    const uploadResult = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log(`Imagen subida, URL: ${downloadURL}`);
    return downloadURL;
  }

  // Borra una imagen de Firebase Storage usando su URL
  private async deleteImage(imageUrl: string): Promise<void> {
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
        console.warn(`La imagen ${imageUrl} no se encontró en Storage, puede que ya estuviera borrada.`);
      } else {
        console.error("Error al borrar imagen de Storage:", error);
      }
    }
  }

  // --- MÉTODOS CRUD DISFRACES ---

  async addCostume(costumeData: Partial<Costume>, imageFile?: File): Promise<void> {
    if (!imageFile) throw new Error("La imagen es obligatoria para nuevos disfraces.");
    if (!costumeData.name) throw new Error("El nombre es obligatorio para subir la imagen.");

    let imageUrl = '';
    try {
      imageUrl = await this.uploadImage(imageFile, costumeData.name, 'costume-images');
      const finalCostumeData: Omit<Costume, 'id'> = {
        name: costumeData.name,
        region: costumeData.region || 'Costa',
        price: costumeData.price ?? 0,
        description: costumeData.description || '',
        sizes: costumeData.sizes || [],
        image: imageUrl
      };
      const docRef = await addDoc(this.costumesCollection, finalCostumeData);
      console.log("Disfraz añadido con ID: ", docRef.id);
    } catch (error) {
      console.error("Error al añadir disfraz:", error);
      if (imageUrl) await this.deleteImage(imageUrl);
      throw error;
    }
  }

  async updateCostume(id: string, costumeData: Partial<Costume>, imageFile?: File): Promise<void> {
     if (!id) throw new Error("ID del disfraz es requerido para actualizar.");
     const costumeToUpdate = this.costumes().find(c => c.id === id);
     let newImageUrl = costumeData.image;
     let oldImageUrl = costumeToUpdate?.image;

     try {
       if (imageFile) {
         if (!costumeData.name) throw new Error("El nombre es necesario para nombrar la imagen.");
         newImageUrl = await this.uploadImage(imageFile, costumeData.name, 'costume-images');
         console.log("Nueva imagen de disfraz subida:", newImageUrl);
       }

       const finalCostumeData = {
         name: costumeData.name ?? costumeToUpdate?.name ?? '',
         region: costumeData.region ?? costumeToUpdate?.region ?? 'Costa',
         price: costumeData.price ?? costumeToUpdate?.price ?? 0,
         description: costumeData.description ?? costumeToUpdate?.description ?? '',
         sizes: costumeData.sizes ?? costumeToUpdate?.sizes ?? [],
         image: newImageUrl ?? costumeToUpdate?.image
       };

       const costumeDocRef = doc(this.firestore, 'costumes', id);
       await updateDoc(costumeDocRef, finalCostumeData);
       console.log("Disfraz actualizado con ID:", id);

       if (imageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
         console.log("Borrando imagen antigua del disfraz...");
         await this.deleteImage(oldImageUrl);
       }
     } catch (error) {
       console.error("Error al actualizar disfraz:", error);
       if (imageFile && newImageUrl && newImageUrl !== oldImageUrl) {
         await this.deleteImage(newImageUrl);
       }
       throw error;
     }
  }

  async deleteCostume(id: string): Promise<void> {
    if (!id) throw new Error("ID del disfraz es requerido para eliminar.");
    const costumeToDelete = this.costumes().find(c => c.id === id);

    try {
      const costumeDocRef = doc(this.firestore, 'costumes', id);
      await deleteDoc(costumeDocRef);
      console.log("Documento de disfraz eliminado:", id);

      if (costumeToDelete?.image) {
        await this.deleteImage(costumeToDelete.image);
      }
    } catch (error) {
      console.error("Error al eliminar disfraz:", error);
      throw error;
    }
  }

  // --- MÉTODOS CRUD BANNERS ---

  async addBanner(bannerData: Partial<Banner>, imageFile?: File): Promise<void> {
    if (!imageFile) throw new Error("La imagen es obligatoria para nuevos banners.");
    if (!bannerData.title) throw new Error("El título es obligatorio para subir la imagen.");

    let imageUrl = '';
    try {
      imageUrl = await this.uploadImage(imageFile, bannerData.title, 'banner-images');
      const finalBannerData: Omit<Banner, 'id'> = {
        festivity: bannerData.festivity || 'General',
        title: bannerData.title,
        subtitle: bannerData.subtitle || '',
        buttonText: bannerData.buttonText || 'Ver más',
        image: imageUrl
      };
      const docRef = await addDoc(this.bannersCollection, finalBannerData);
      console.log("Banner añadido con ID: ", docRef.id);
      // Si es el primer banner añadido Y no hay un ID activo ya cargado, lo activamos
      if (this.banners().length === 1 && !this.activeBannerId()) {
         console.log("Activando el primer banner añadido por defecto.");
         await this.setActiveBanner(docRef.id);
      }
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
        newImageUrl = await this.uploadImage(imageFile, bannerData.title, 'banner-images');
        console.log("Nueva imagen de banner subida:", newImageUrl);
      }

      const finalBannerData = {
        festivity: bannerData.festivity ?? bannerToUpdate?.festivity ?? 'General',
        title: bannerData.title ?? bannerToUpdate?.title ?? '',
        subtitle: bannerData.subtitle ?? bannerToUpdate?.subtitle ?? '',
        buttonText: bannerData.buttonText ?? bannerToUpdate?.buttonText ?? 'Ver más',
        image: newImageUrl ?? bannerToUpdate?.image
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

    // Si el banner a borrar es el activo, desactívalo
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

  // --- MÉTODO PARA BANNER ACTIVO ---
  // Guarda/Actualiza el ID del banner activo en Firestore ('config/activeBanner')
  async setActiveBanner(id: string | null): Promise<void> {
    try {
      const docRef = doc(this.configCollection, ACTIVE_BANNER_DOC_ID);
      await setDoc(docRef, { activeId: id }, { merge: true });
      // Ya no necesitamos .set() aquí, el Observable activeBannerId$ lo detectará
      console.log("Banner activo guardado/actualizado en Firestore:", id);
    } catch (error) {
      console.error("Error guardando banner activo:", error);
      throw error;
    }
  }

  // --- MÉTODOS DE FILTRO DISFRACES ---
  setRegionFilter(region: 'Todos' | 'Costa' | 'Sierra' | 'Selva') {
    this.regionFilter.set(region);
  }

  setSizeFilter(size: 'Todos' | 'S' | 'M' | 'L' | 'XL') {
    this.sizeFilter.set(size);
  }
}