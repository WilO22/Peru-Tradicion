// src/app/pages/register/register.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../services/auth'; // Nuestro servicio Auth
// 1. Importa el servicio de la LIBRERÍA CORRECTA
import { HotToastService } from '@ngxpert/hot-toast'; // <-- ¡Nombre corregido!

@Component({
  selector: 'app-register',
  standalone: true,
  // Principio Standalone: Importamos lo que necesitamos
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  // --- 1. Inyección de Dependencias ---
  #authService: Auth = inject(Auth);
  #router: Router = inject(Router);
  #fb: FormBuilder = inject(FormBuilder);
  #toast: HotToastService = inject(HotToastService); // 2. Inyéctalo

  // --- 2. Gestión de Estado con Signals ---
  isLoading = signal(false);
  registerError = signal<string | null>(null);

  // --- 3. Definición del Formulario Reactivo ---
  registerForm: FormGroup = this.#fb.group({
    // Usamos los mismos validadores que en el login
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
    // Podríamos añadir un campo 'confirmPassword' con un validador
    // personalizado, pero lo mantendremos simple por ahora.
  });

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.registerError.set(null);

    try {
      // --- ¡EL GRAN CAMBIO ESTÁ AQUÍ! ---
      // Llamamos a nuestro método 'register' orquestado
      await this.#authService.register(
        this.registerForm.value.email,
        this.registerForm.value.password
      );
      
      // 3. ¡LA MEJORA! Reemplaza 'alert' con el Toast
      this.#toast.success('¡Registro exitoso! Redirigiendo al login...');
      this.#router.navigate(['/login']);
      
    } catch (error: any) {
      // Manejo de errores de Firebase
      console.error('Error de registro:', error.code);
      
      // 4. Mantenemos el error en-línea
      if (error.code === 'auth/email-already-in-use') {
        this.registerError.set('Este correo electrónico ya está en uso.');
      } else {
        this.registerError.set('Ocurrió un error inesperado al registrar.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}