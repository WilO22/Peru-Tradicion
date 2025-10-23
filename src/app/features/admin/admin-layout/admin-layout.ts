// src/app/features/admin/admin-layout/admin-layout.ts

import { Component, inject } from '@angular/core';
// Importa Router, RouterOutlet, RouterLink, y RouterLinkActive
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; 
import { Auth } from '../../../core/services/auth'; // Importa Auth

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // Añádelos a los imports
  imports: [RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css' 
})
export default class AdminLayout {
  
  // 1. Inyecta los servicios
  private authService = inject(Auth);
  private router = inject(Router);

  // 2. Método para cerrar sesión (¡ESTO FALTABA!)
  async handleLogout() {
    try {
      await this.authService.logout();
      // Ya no necesitamos navegar aquí, el servicio 'Auth' lo hace.
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  }
}