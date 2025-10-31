// src/app/pages/home/home.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Reemplazamos LowerCasePipe
import { Costume } from '../../services/costume';
import { CostumeSize } from '../../interfaces/costume.model';

// ↓↓↓ CORRECCIÓN: Esta es la ruta correcta al archivo del componente ↓↓↓
import { PublicBanner } from '../../components/public-banner/public-banner'; 

@Component({
  selector: 'app-home',
  standalone: true,
  // Ahora que la importación es correcta, PublicBanner es una referencia válida
  imports: [CommonModule, PublicBanner], 
  templateUrl: './home.html',
})
export default class Home {
  private costumeService = inject(Costume);

  costumes = this.costumeService.filteredCostumes; 
  selectedSize = this.costumeService.selectedSize; 

  changeSize(size: CostumeSize | 'Todos') {
    this.costumeService.changeSize(size);
  }
}