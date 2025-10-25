// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-manage-banners',
//   imports: [],
//   templateUrl: './manage-banners.html',
//   styleUrl: './manage-banners.css',
// })
// export default class ManageBanners {

// }


//---------------------------------------------

// src/app/features/admin/pages/manage-banners/manage-banners.ts

// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common'; // Para @if, @for
// import { Firestore } from '../../../../core/services/firestore';
// import { Banner } from '../../../../core/models/banner';
// // Importaremos el modal de banner más adelante
// // import BannerFormModal from '../../../../shared/components/banner-form-modal/banner-form-modal';

// @Component({
//   selector: 'app-manage-banners',
//   standalone: true,
//   imports: [CommonModule], // Añadiremos BannerFormModal después
//   templateUrl: './manage-banners.html',
//   styleUrl: './manage-banners.css'
// })
// export default class ManageBanners {
//   public firestore = inject(Firestore);

//   // Lógica para el modal (similar a disfraces, se añadirá después)
//   isModalVisible = signal(false);
//   editingBanner = signal<Banner | null>(null);

//   newBanner() {
//     console.log("Abrir modal Nuevo Banner...");
//     // this.editingBanner.set(null);
//     // this.isModalVisible.set(true);
//   }

//   editBanner(banner: Banner) {
//      console.log("Editar banner:", banner.id);
//     // this.editingBanner.set(banner);
//     // this.isModalVisible.set(true);
//   }

//   deleteBanner(id: string) {
//      if (confirm('¿Estás seguro de eliminar este banner?')) {
//        console.log("Eliminar banner:", id);
//        this.firestore.deleteBanner(id).catch(err => alert(`Error: ${err}`));
//      }
//   }

//   // Método para activar un banner
//   activateBanner(id: string) {
//     console.log("Activar banner:", id);
//     this.firestore.setActiveBanner(id).catch(err => alert(`Error: ${err}`));
//   }

//   closeModal() {
//      this.isModalVisible.set(false);
//      this.editingBanner.set(null);
//   }

//   handleSaveBanner(eventData: { bannerData: Partial<Banner>, imageFile?: File }) {
//      console.log("Guardar banner:", eventData);
//      // TODO: Llamar al servicio firestore
//      this.closeModal();
//   }
// }

//----------------------------------------------------------------------------------------

// src/app/features/admin/pages/manage-banners/manage-banners.ts

import { Component, inject, signal } from '@angular/core'; // <-- Añade signal
import { CommonModule } from '@angular/common';
import { Firestore } from '../../../../core/services/firestore';
import { Banner } from '../../../../core/models/banner';
import BannerFormModal from '../../../../shared/components/banner-form-modal/banner-form-modal';

// 👇 Importa el nuevo componente modal


@Component({
  selector: 'app-manage-banners',
  standalone: true,
  // 👇 Añade BannerFormModal a los imports
  imports: [CommonModule, BannerFormModal],
  templateUrl: './manage-banners.html',
  styleUrl: './manage-banners.css'
})
export default class ManageBanners { // <-- Nombre de clase sin sufijo
  public firestore = inject(Firestore);

  // --- Lógica del Modal ---
  isModalVisible = signal(false);
  editingBanner = signal<Banner | null>(null);

  newBanner() {
    this.editingBanner.set(null);
    this.isModalVisible.set(true);
  }

  editBanner(banner: Banner) {
     this.editingBanner.set(banner);
     this.isModalVisible.set(true);
  }

  closeModal() {
     this.isModalVisible.set(false);
     this.editingBanner.set(null);
  }

  // Se llamará cuando el modal emita 'save'
  async handleSaveBanner(eventData: { bannerData: Partial<Banner>, imageFile?: File }) {
     const { bannerData, imageFile } = eventData;
     const currentBanner = this.editingBanner();

     // isLoading.set(true); // Opcional
     try {
        if (currentBanner?.id) {
           // --- Lógica de Actualización ---
           console.log('Actualizando banner:', currentBanner.id, bannerData, imageFile);
           await this.firestore.updateBanner(currentBanner.id, bannerData, imageFile);
           console.log('Banner actualizado con éxito.');
        } else {
           // --- Lógica de Creación ---
           console.log('Añadiendo nuevo banner:', bannerData, imageFile);
           await this.firestore.addBanner(bannerData, imageFile);
           console.log('Banner añadido con éxito.');
        }
        this.closeModal();
     } catch(error) {
        console.error("Error al guardar banner:", error);
        alert(`Error al guardar: ${error}`);
     } finally {
        // isLoading.set(false); // Opcional
     }
  }
  // --- Fin Lógica del Modal ---

  deleteBanner(id: string) {
     if (confirm('¿Estás seguro de eliminar este banner?')) {
       // isLoading.set(true); // Opcional
       this.firestore.deleteBanner(id)
         .then(() => console.log('Banner eliminado con éxito.'))
         .catch(err => alert(`Error al eliminar: ${err}`))
         // .finally(() => isLoading.set(false)); // Opcional
     }
  }

  activateBanner(id: string) {
    // isLoading.set(true); // Opcional
    this.firestore.setActiveBanner(id)
      .then(() => console.log('Banner activado con éxito.'))
      .catch(err => alert(`Error al activar: ${err}`))
      // .finally(() => isLoading.set(false)); // Opcional
  }
}