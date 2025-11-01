// src/app/pages/admin/manage-banners/manage-banners.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';
import { Banner } from '../../../services/banner';
import { BannerModel } from '../../../interfaces/banner.model';
import { BannerForm } from '../../../components/banner-form/banner-form';

// --- 1. Importar el nuevo modal ---
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-manage-banners',
  standalone: true,
  // --- 2. Añadir ConfirmModal a los imports ---
  imports: [CommonModule, BannerForm, ConfirmModal],
  templateUrl: './manage-banners.html',
})
export class ManageBanners {
  #bannerService = inject(Banner);
  #toast = inject(HotToastService);

  banners = this.#bannerService.allBanners;

  // --- Estado del Modal de Formulario ---
  isFormModalOpen = signal(false);
  selectedBanner = signal<BannerModel | null>(null);

  // --- 3. Nuevos Signals para el Modal de Confirmación ---
  isConfirmModalOpen = signal(false);
  bannerToDelete = signal<BannerModel | null>(null);

  // --- Métodos del Modal de Formulario ---
  openFormModal(banner: BannerModel | null) {
    this.selectedBanner.set(banner);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.selectedBanner.set(null);
  }

  // --- 4. Métodos para el Modal de Confirmación ---

  // El botón 'Eliminar' de la tabla ahora llama a ESTE método
  openConfirmModal(banner: BannerModel) {
    this.bannerToDelete.set(banner);
    this.isConfirmModalOpen.set(true);
  }

  closeConfirmModal() {
    this.isConfirmModalOpen.set(false);
    this.bannerToDelete.set(null);
  }

  // El modal de confirmación emite (confirm) y llama a ESTE método
  async handleConfirmDelete() {
    const banner = this.bannerToDelete();
    if (!banner) return;

    try {
      await this.#bannerService.deleteBanner(banner.id);
      this.#toast.success('Banner eliminado');
    } catch (error) {
      this.#toast.error('Error al eliminar el banner.');
    }

    this.closeConfirmModal();
  }

  // Método de 'Activar' (sin cambios)
  async activateBanner(banner: BannerModel) {
    if (banner.isActive) return;
    const toastRef = this.#toast.loading('Activando banner...');
    try {
      await this.#bannerService.setActiveBanner(banner);
      toastRef.close();
      this.#toast.success('Banner activado');
    } catch (error) {
      toastRef.close();
      this.#toast.error('Error al activar el banner.');
    }
  }
}