// src/app/layout/admin/admin.ts
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common'; // Para @if

@Component({
  selector: 'app-admin',
  standalone: true,
  // --- Principio: Arquitectura Standalone ---
  // Importamos los módulos de Enrutamiento aquí
  imports: [
    CommonModule,
    RouterOutlet,   // <-- El <router-outlet> para las páginas hijas
    RouterLink,     // <-- El [routerLink] para los enlaces de navegación
    RouterLinkActive // <-- El [routerLinkActive] para marcar el enlace activo
  ],
  templateUrl: './admin.html',
})
export class Admin {
  // --- Principio: Inyección con inject() ---
  authService = inject(Auth);

  // --- Principio: Gestión de Estado con Signals ---
  isMobileMenuOpen = signal(false);

  logout() {
    this.authService.logout();
    this.isMobileMenuOpen.set(false); // Cerramos menú al salir
  }
}