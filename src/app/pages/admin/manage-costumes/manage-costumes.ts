// src/app/pages/admin/manage-costumes/manage-costumes.ts

import { Component, inject, signal } from '@angular/core'; // ¡Importamos signal!
import { Costume } from '../../../services/costume'; 
import { CostumeModel } from '../../../interfaces/costume.model'; 
import { CostumeForm } from '../../../components/costume-form/costume-form'; // <-- 1. Importar el Formulario

@Component({
  selector: 'app-manage-costumes',
  standalone: true,
  imports: [
    CostumeForm // <-- 2. Añadir el Formulario a los imports
  ], 
  templateUrl: './manage-costumes.html', 
})
export class ManageCostumes { 
  
  private costumeService = inject(Costume);

  // El Signal con la lista completa de disfraces (sin cambios)
  public costumes = this.costumeService.allCostumes; 

  // --- 3. Estado para gestionar el Modal ---
  public isModalOpen = signal(false);
  public editingCostume = signal<CostumeModel | null>(null);

  constructor() {}

  // --- 4. Métodos para controlar el Modal ---

  // Se llama al hacer clic en "Nuevo Disfraz"
  openCreateModal() {
    this.editingCostume.set(null); // 'null' significa modo "Crear"
    this.isModalOpen.set(true);
  }

  // Se llama al hacer clic en "Editar" en una fila
  openEditModal(costume: CostumeModel) {
    this.editingCostume.set(costume); // Pasamos el disfraz al modal
    this.isModalOpen.set(true);
  }

  // Se llama cuando el formulario emite el evento (close)
  closeModal() {
    this.isModalOpen.set(false);
    this.editingCostume.set(null); // Limpiamos el estado
  }

  // Lógica de borrado (sin cambios)
  onDelete(id: string, name: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar el disfraz "${name}"?`)) {
      this.costumeService.deleteCostume(id)
        .then(() => console.log(`Disfraz "${name}" eliminado.`))
        .catch(err => console.error('Error al eliminar:', err));
    }
  }
}