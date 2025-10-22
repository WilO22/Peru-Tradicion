// src/app/features/admin/admin-layout/admin-layout.ts

import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'; // <-- Importa Router
import { Auth } from '../../../core/services/auth'; // <-- Importa Auth

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export default class AdminLayout {

  // 1. Inyecta los servicios
  private authService = inject(Auth);
  private router = inject(Router);

  // 2. Método para cerrar sesión
  async handleLogout() {
    try {
      await this.authService.logout();
      // Si el logout es exitoso, redirigimos al login
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  }
}