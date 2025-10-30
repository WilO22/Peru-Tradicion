// src/app/pages/admin/manage-costumes/manage-costumes.ts

import { Component, inject } from '@angular/core';
import { Costume } from '../../../services/costume'; // Importamos el SERVICIO
import { CostumeModel } from '../../../interfaces/costume.model'; 

@Component({
  selector: 'app-manage-costumes',
  standalone: true,
  imports: [], 
  templateUrl: './manage-costumes.html', 
})
export class ManageCostumes { 
  
  private costumeService = inject(Costume);

  // ↓↓↓ CORRECCIÓN PRINCIPAL: Apuntamos a 'allCostumes' ↓↓↓
  // 'manage-costumes' usa la lista COMPLETA ('allCostumes')
  // 'home' usa la lista FILTRADA ('filteredCostumes')
  public costumes = this.costumeService.allCostumes; 

  constructor() {
    // Constructor limpio
  }

  // Métodos para el CRUD
  openCostumeModal() {
    console.log('Abrir modal para nuevo disfraz');
  }

  editCostume(costume: CostumeModel) {
    console.log('Editar disfraz', costume);
  }

  onDelete(id: string, name: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar el disfraz "${name}"?`)) {
      this.costumeService.deleteCostume(id)
        .then(() => {
          console.log(`Disfraz "${name}" eliminado exitosamente.`);
          // El Signal 'allCostumes' se actualizará automáticamente.
        })
        .catch(err => {
          console.error('Error al eliminar el disfraz:', err);
        });
    }
  }
}