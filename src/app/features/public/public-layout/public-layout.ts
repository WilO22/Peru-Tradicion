// src/app/features/public/public-layout/public-layout.ts

import { Component, inject } from '@angular/core'; // <-- Asegúrate que 'inject' esté
import { RouterOutlet } from '@angular/router';
import { Firestore } from '../../../core/services/firestore'; // <-- Importa el servicio

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export default class PublicLayout {
  // Inyecta el servicio y hazlo público para el HTML
  public firestore = inject(Firestore); 

  // Expone el método para que el HTML lo llame
  setRegionFilter(region: any) {
    this.firestore.setRegionFilter(region);
  }
}