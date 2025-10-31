// src/app/pages/admin/manage-costumes/manage-costumes.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';
import { Costume } from '../../../services/costume';
import { CostumeModel } from '../../../interfaces/costume.model';

// 1. Importamos nuestro componente de formulario
import { CostumeForm } from '../../../components/costume-form/costume-form';

@Component({
  selector: 'app-manage-costumes',
  standalone: true,
  // 2. Añadimos CommonModule y CostumeForm a los imports
  imports: [CommonModule, CostumeForm],
  templateUrl: './manage-costumes.html',
})
export class ManageCostumes {
  // --- Principio: Inyección con inject() ---
  #costumeService = inject(Costume);
  #toast = inject(HotToastService);

  // --- Principio: Gestión de Estado con Signals ---

  // Obtenemos el Signal de disfraces (la lista COMPLETA)
  costumes = this.#costumeService.allCostumes;

  // Signals locales para manejar el estado del modal
  isModalOpen = signal(false);
  selectedCostume = signal<CostumeModel | null>(null);

  constructor() {
    // Opcional: ver cómo cambia el Signal de disfraces
    // effect(() => {
    //   console.log('Lista de disfraces actualizada:', this.costumes());
    // });
  }

  // --- Métodos de la UI ---

  openModal(costume: CostumeModel | null) {
    this.selectedCostume.set(costume); // Ponemos el disfraz a editar (o null si es nuevo)
    this.isModalOpen.set(true);      // Abrimos el modal
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedCostume.set(null); // Limpiamos la selección
  }

  async deleteCostume(costume: CostumeModel) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${costume.name}"?`)) {
      try {
        // Llamamos al método del servicio
        await this.#costumeService.deleteCostume(costume.id);
        this.#toast.success('Disfraz eliminado');
        // NOTA: No necesitamos actualizar la lista. El Signal 'allCostumes'
        // de 'costume.ts' se actualiza solo gracias a 'collectionData'.
      } catch (error) {
        console.error(error);
        this.#toast.error('Error al eliminar el disfraz');
      }
    }
  }
}