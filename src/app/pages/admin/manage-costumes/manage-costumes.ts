// src/app/pages/admin/manage-costumes/manage-costumes.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';
import { Costume } from '../../../services/costume';
import { CostumeModel } from '../../../interfaces/costume.model';
import { CostumeForm } from '../../../components/costume-form/costume-form';

// --- 1. Importar el nuevo modal ---
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-manage-costumes',
  standalone: true,
  // --- 2. Añadir ConfirmModal a los imports ---
  imports: [CommonModule, CostumeForm, ConfirmModal],
  templateUrl: './manage-costumes.html',
})
export class ManageCostumes {
  #costumeService = inject(Costume);
  #toast = inject(HotToastService);

  costumes = this.#costumeService.allCostumes;

  // --- Estado del Modal de Formulario (sin cambios) ---
  isFormModalOpen = signal(false);
  selectedCostume = signal<CostumeModel | null>(null);

  // --- 3. Nuevos Signals para el Modal de Confirmación ---
  isConfirmModalOpen = signal(false);
  costumeToDelete = signal<CostumeModel | null>(null);

  // --- Métodos del Modal de Formulario (sin cambios) ---
  openFormModal(costume: CostumeModel | null) {
    this.selectedCostume.set(costume);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.selectedCostume.set(null);
  }

  // --- 4. Métodos para el Modal de Confirmación ---

  // El botón 'Eliminar' de la tabla ahora llama a ESTE método
  openConfirmModal(costume: CostumeModel) {
    this.costumeToDelete.set(costume); // Guarda el disfraz a eliminar
    this.isConfirmModalOpen.set(true); // Abre el modal de confirmación
  }

  closeConfirmModal() {
    this.isConfirmModalOpen.set(false);
    this.costumeToDelete.set(null);
  }

  // El modal de confirmación emite (confirm) y llama a ESTE método
  async handleConfirmDelete() {
    const costume = this.costumeToDelete(); // Obtiene el disfraz guardado
    if (!costume) return;

    try {
      await this.#costumeService.deleteCostume(costume.id);
      this.#toast.success('Disfraz eliminado');
    } catch (error) {
      console.error(error);
      this.#toast.error('Error al eliminar el disfraz');
    }

    this.closeConfirmModal(); // Cierra el modal
  }
}