// src/app/layout/admin/admin.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  // Principio (Standalone): Importamos lo que usamos
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin { // <-- El nombre de la clase debe ser 'Admin'
  
  // Inyectamos el servicio Auth
  #authService: Auth = inject(Auth);

  // Método para el botón de "Cerrar Sesión"
  onLogout() {
    this.#authService.logout();
  }
}