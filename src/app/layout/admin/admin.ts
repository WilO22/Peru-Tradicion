// src/app/layout/admin/admin.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Añadir RouterLinkActive
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Añadir RouterLinkActive
  templateUrl: './admin.html',
  styleUrl: './admin.css' // Puedes añadir estilos si quieres
})
export class Admin {
  #authService: Auth = inject(Auth);

  onLogout() {
    this.#authService.logout();
  }
}