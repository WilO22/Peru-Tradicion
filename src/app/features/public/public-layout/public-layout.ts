// src/app/features/public/public-layout/public-layout.ts

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // <-- Añade RouterLink
import { Firestore } from '../../../core/services/firestore';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink], // <-- Añade RouterLink a imports
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export default class PublicLayout {
  public firestore = inject(Firestore);
  // Variable para el año actual en el footer
  public currentYear = new Date().getFullYear();

  setRegionFilter(region: any) {
    this.firestore.setRegionFilter(region);
  }
}