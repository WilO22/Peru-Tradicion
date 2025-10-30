// src/app/components/header/header.ts

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Importa RouterLink
import { Auth } from '../../services/auth';
import { Costume } from '../../services/costume'; // <-- 1. Importar el servicio
import { CostumeRegion } from '../../interfaces/costume.model'; // <-- 2. Importar el tipo

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink], // <-- 3. Asegurarse que RouterLink esté aquí
  templateUrl: './header.html',
})
export class Header {
  authService = inject(Auth);
  router = inject(Router);

  // --- 4. Inyectar el servicio de Disfraces ---
  costumeService = inject(Costume);
  
  // --- 5. Exponer el estado y los métodos a la plantilla ---
  selectedRegion = this.costumeService.selectedRegion;
  
  changeRegion(region: CostumeRegion | 'Todos') {
    this.costumeService.changeRegion(region);
    // Opcional: Si estás en otra página, navegar al home
    // this.router.navigate(['/']); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}