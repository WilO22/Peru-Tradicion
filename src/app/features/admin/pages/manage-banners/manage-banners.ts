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

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para @if, @for
import { Firestore } from '../../../../core/services/firestore';
import { Banner } from '../../../../core/models/banner';
// Importaremos el modal de banner más adelante
// import BannerFormModal from '../../../../shared/components/banner-form-modal/banner-form-modal';

@Component({
  selector: 'app-manage-banners',
  standalone: true,
  imports: [CommonModule], // Añadiremos BannerFormModal después
  templateUrl: './manage-banners.html',
  styleUrl: './manage-banners.css'
})
export default class ManageBanners {
  public firestore = inject(Firestore);

  // Lógica para el modal (similar a disfraces, se añadirá después)
  isModalVisible = signal(false);
  editingBanner = signal<Banner | null>(null);

  newBanner() {
    console.log("Abrir modal Nuevo Banner...");
    // this.editingBanner.set(null);
    // this.isModalVisible.set(true);
  }

  editBanner(banner: Banner) {
     console.log("Editar banner:", banner.id);
    // this.editingBanner.set(banner);
    // this.isModalVisible.set(true);
  }

  deleteBanner(id: string) {
     if (confirm('¿Estás seguro de eliminar este banner?')) {
       console.log("Eliminar banner:", id);
       this.firestore.deleteBanner(id).catch(err => alert(`Error: ${err}`));
     }
  }

  // Método para activar un banner
  activateBanner(id: string) {
    console.log("Activar banner:", id);
    this.firestore.setActiveBanner(id).catch(err => alert(`Error: ${err}`));
  }

  closeModal() {
     this.isModalVisible.set(false);
     this.editingBanner.set(null);
  }

  handleSaveBanner(eventData: { bannerData: Partial<Banner>, imageFile?: File }) {
     console.log("Guardar banner:", eventData);
     // TODO: Llamar al servicio firestore
     this.closeModal();
  }
}