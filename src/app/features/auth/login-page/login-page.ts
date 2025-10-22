// src/app/features/auth/login-page/login-page.ts

import { Component, inject } from '@angular/core';
// Ya no necesitamos Router aquí
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
  // private router = inject(Router); // <-- Ya no es necesario

  async handleLogin() {
    try {
      // Solo iniciamos el login, el servicio hará el resto
      await this.authService.loginWithGoogle();
      // No navegamos desde aquí
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    }
  }
}