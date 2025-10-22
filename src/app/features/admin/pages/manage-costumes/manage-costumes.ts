// src/app/features/admin/pages/manage-costumes/manage-costumes.ts

import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common'; // Para formatear precio
// Importamos nuestro servicio Firestore
import { Firestore } from '../../../../core/services/firestore';

@Component({
  selector: 'app-manage-costumes',
  standalone: true,
  imports: [CurrencyPipe], // Añadimos el pipe
  templateUrl: './manage-costumes.html',
  styleUrl: './manage-costumes.css'
})
export default class ManageCostumes {
  // Inyectamos el servicio para acceder a los disfraces
  public firestore = inject(Firestore);

  // Métodos para acciones futuras (editar, eliminar)
  editCostume(id: string) {
    console.log('Editar disfraz con ID:', id);
    // TODO: Implementar lógica de edición
  }

  deleteCostume(id: string) {
    console.log('Eliminar disfraz con ID:', id);
    // TODO: Implementar lógica de eliminación
  }
}