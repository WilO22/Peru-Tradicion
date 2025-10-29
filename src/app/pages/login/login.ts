// src/app/pages/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../services/auth'; // Nuestro servicio Auth

// Principio (Standalone): Este componente importa TODO lo que necesita.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, // Para [formGroup] y formControlName
    RouterLink           // Para [routerLink]
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // --- 1. Inyección de Dependencias ---
  // Principio (inject()): Inyectamos nuestros servicios.
  #authService: Auth = inject(Auth);
  #router: Router = inject(Router);
  #fb: FormBuilder = inject(FormBuilder); // FormBuilder nos ayuda a crear formularios

  // --- 2. Gestión de Estado con Signals ---
  // Principio (Signals): Manejamos el estado de la UI (carga y error)
  isLoading = signal(false);
  loginError = signal<string | null>(null);

  // --- 3. Definición del Formulario Reactivo ---
  loginForm: FormGroup = this.#fb.group({
    // Definimos los controles y sus validadores
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    // Detener si el formulario no es válido
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Mostrar errores si el usuario no tocó los campos
      return;
    }

    // Activar estado de carga y limpiar errores
    this.isLoading.set(true);
    this.loginError.set(null);

    try {
      // Llamar a nuestro servicio de Auth
      await this.#authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      
      // ¡Éxito! Redirigir al home
      // (Más adelante, si es admin, lo redirigiremos a /admin)
      this.#router.navigate(['/']);
      
    } catch (error: any) {
      // Manejo de errores de Firebase
      console.error('Error de login:', error.code);
      
      // Principio (Tipado Estricto): Revisamos el 'error.code'
      if (error.code === 'auth/invalid-credential') {
        this.loginError.set('Usuario o contraseña incorrectos.');
      } else {
        this.loginError.set('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      // Desactivar estado de carga (pase lo que pase)
      this.isLoading.set(false);
    }
  }
}