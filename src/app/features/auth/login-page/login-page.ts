// src/app/features/auth/login-page/login-page.ts

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export default class LoginPage {

  private authService = inject(Auth);
  private router = inject(Router);

  async handleLogin() {
    try {
      await this.authService.loginWithGoogle();

      // Ahora, el guard se encargará de esperar.
      this.router.navigate(['/admin']); 

    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    }
  }
}