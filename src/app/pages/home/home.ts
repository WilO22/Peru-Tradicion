// src/app/pages/home/home.ts

import { Component, inject } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { Costume } from '../../services/costume'; 
import { CostumeSize } from '../../interfaces/costume.model'; // <-- 1. Importar el tipo

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LowerCasePipe], 
  templateUrl: './home.html',
})
export default class Home {
  private costumeService = inject(Costume);

  // --- 2. Exponer el estado y los métodos a la plantilla ---
  
  // ¡'costumes' ahora es el Signal de la lista YA FILTRADA!
  costumes = this.costumeService.filteredCostumes; 
  
  // Exponemos el estado actual del filtro de talla
  selectedSize = this.costumeService.selectedSize; 

  // Exponemos el método para cambiar la talla
  changeSize(size: CostumeSize | 'Todos') {
    this.costumeService.changeSize(size);
  }
}