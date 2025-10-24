// src/app/features/admin/pages/manage-costumes/manage-costumes.ts

import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Firestore } from '../../../../core/services/firestore';
// 👇 Importa el nuevo componente modal (ajusta la ruta si es necesario)
import CostumeFormModal from '../../../../shared/components/costume-form-modal/costume-form-modal';
import { Costume } from '../../../../core/models/costume';

@Component({
  selector: 'app-manage-costumes',
  standalone: true,
  // 👇 Añade el modal a los imports
  imports: [CurrencyPipe, CostumeFormModal],
  templateUrl: './manage-costumes.html',
  styleUrl: './manage-costumes.css'
})
export default class ManageCostumes { // <-- Nombre de clase sin sufijo
  public firestore = inject(Firestore);

  // --- Lógica del Modal ---
  isModalVisible = signal(false);
  editingCostume = signal<Costume | null>(null);

  newCostume() {
    this.editingCostume.set(null);
    this.isModalVisible.set(true);
  }

  // Recibe el objeto Costume completo
  editCostume(costume: Costume) {
    this.editingCostume.set(costume);
    this.isModalVisible.set(true);
  }

  closeModal() {
    this.isModalVisible.set(false);
    this.editingCostume.set(null);
  }

  // Se llamará cuando el modal emita 'save'
  async handleSaveCostume(eventData: { costumeData: Partial<Costume>, imageFile?: File }) {
     const { costumeData, imageFile } = eventData;
     const currentCostume = this.editingCostume();

     try {
       if (currentCostume) {
         // --- Lógica de Actualización ---
         console.log('Actualizando disfraz:', currentCostume.id, costumeData, imageFile);
         await this.firestore.updateCostume(currentCostume.id, costumeData, imageFile);
         // TODO: Mostrar notificación de éxito
       } else {
         // --- Lógica de Creación ---
         console.log('Añadiendo nuevo disfraz:', costumeData, imageFile);
         await this.firestore.addCostume(costumeData, imageFile);
         // TODO: Mostrar notificación de éxito
       }
       this.closeModal(); // Cierra el modal si todo va bien
     } catch (error) {
       console.error("Error al guardar el disfraz:", error);
       // TODO: Mostrar notificación de error al usuario
     }
  }
  // --- Fin Lógica del Modal ---

  async deleteCostume(id: string) {
    // Confirmación simple (mejor usar un modal de confirmación en una app real)
    if (confirm('¿Estás seguro de que quieres eliminar este disfraz?')) {
      try {
        console.log('Eliminando disfraz con ID:', id);
        await this.firestore.deleteCostume(id);
         // TODO: Mostrar notificación de éxito
      } catch (error) {
        console.error("Error al eliminar el disfraz:", error);
        // TODO: Mostrar notificación de error al usuario
      }
    }
  }
}