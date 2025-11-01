// src/app/pages/admin/manage-banners/manage-banners.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';

// --- CORRECCIÓN DE RUTAS: Usamos ../../../ ---
import { Banner } from '../../../services/banner';
import { BannerModel } from '../../../interfaces/banner.model';
import { BannerForm } from '../../../components/banner-form/banner-form';
// --- FIN DE LA CORRECCIÓN ---

@Component({
  selector: 'app-manage-banners',
  standalone: true,
  imports: [CommonModule, BannerForm], // Ahora 'BannerForm' se encontrará
  templateUrl: './manage-banners.html',
})
export class ManageBanners {
  // --- Inyección de Dependencias ---
  #bannerService = inject(Banner); // Ahora 'Banner' se encontrará
  #toast = inject(HotToastService);

  // --- Signals de Estado ---
  banners = this.#bannerService.allBanners; // Ya no será 'unknown'
  isModalOpen = signal(false);
  selectedBanner = signal<BannerModel | null>(null);

  // --- Métodos de la UI ---
  openModal(banner: BannerModel | null) {
    this.selectedBanner.set(banner);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedBanner.set(null);
  }

  async deleteBanner(banner: BannerModel) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${banner.festivity}"?`)) {
      try {
        await this.#bannerService.deleteBanner(banner.id); // Ya no será 'unknown'
        this.#toast.success('Banner eliminado');
      } catch (error) {
        this.#toast.error('Error al eliminar el banner.');
      }
    }
  }

  async activateBanner(banner: BannerModel) {
    if (banner.isActive) return;

    const toastRef = this.#toast.loading('Activando banner...');
    try {
      await this.#bannerService.setActiveBanner(banner); // Ya no será 'unknown'
      toastRef.close();
      this.#toast.success('Banner activado');
    } catch (error) {
      toastRef.close();
      this.#toast.error('Error al activar el banner.');
    }
  }
}