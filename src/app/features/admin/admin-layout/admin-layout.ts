// src/app/features/admin/admin-layout/admin-layout.ts

import { Component, inject } from '@angular/core';
// 👇 Importa RouterLink y RouterLinkActive
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; 
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // 👇 Añádelos a los imports
  imports: [RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css' 
})
export default class AdminLayout {

  private authService = inject(Auth);
  private router = inject(Router);

  async handleLogout() {
    // ... (código existente) ...
  }
}