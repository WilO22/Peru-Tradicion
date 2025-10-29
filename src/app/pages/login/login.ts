// src/app/pages/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
// 1. Importa el servicio de Toasts
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // --- 1. Inyección de Dependencias ---
  #authService: Auth = inject(Auth);
  #router: Router = inject(Router);
  #fb: FormBuilder = inject(FormBuilder);
  #toast: HotToastService = inject(HotToastService); // 2. Inyéctalo

  // --- Estado y Formulario (sin cambios) ---
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  loginForm: FormGroup = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.loginError.set(null);

    try {
      await this.#authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      
      // 3. ¡LA MEJORA DE UX! Mostramos un Toast de éxito
      this.#toast.success('¡Inicio de sesión exitoso!');

      // (En el siguiente paso, añadiremos la lógica para redirigir
      // a /admin si el usuario es admin)
      this.#router.navigate(['/']); 
      
    } catch (error: any) {
      console.error('Error de login:', error.code);
      if (error.code === 'auth/invalid-credential') {
        this.loginError.set('Usuario o contraseña incorrectos.');
      } else {
        this.loginError.set('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}