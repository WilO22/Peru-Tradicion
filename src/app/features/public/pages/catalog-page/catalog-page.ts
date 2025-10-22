// src/app/features/public/pages/catalog-page/catalog-page.ts

import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common'; // <-- Importa el pipe
import { Firestore } from '../../../../core/services/firestore'; // <-- Apunta a 'firestore.ts'

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CurrencyPipe], // <-- Añade el pipe a los imports
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css'
})
export default class CatalogPage { // <-- Nombre de clase 'CatalogPage'

  // 1. Inyectamos nuestro servicio
  // Hacemos 'firestore' público para que el HTML pueda acceder a él
  public firestore = inject(Firestore);

  // 2. Exponemos los métodos para que el HTML los llame
  // Nota: Usamos 'any' temporalmente para los tipos de los botones del HTML
  setRegionFilter(region: any) {
    this.firestore.setRegionFilter(region);
  }

  setSizeFilter(size: any) {
    this.firestore.setSizeFilter(size);
  }
}