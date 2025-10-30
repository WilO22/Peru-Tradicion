// src/app/pages/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { HotToastService } from '@ngxpert/hot-toast';
// 1. IMPORTAMOS UserService y firstValueFrom
import { User as UserService } from '../../services/user'; // Renombramos para claridad
import { firstValueFrom } from 'rxjs'; 
import { UserProfile } from '../../interfaces/user.model'; // Importamos la interfaz

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // --- Inyección de Dependencias ---
  #authService: Auth = inject(Auth);
  #router: Router = inject(Router);
  #fb: FormBuilder = inject(FormBuilder);
  #toast: HotToastService = inject(HotToastService);
  #userService: UserService = inject(UserService); // 2. Inyectamos UserService

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
      // --- PASO 1: Intentar Iniciar Sesión ---
      const userCredential = await this.#authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        throw new Error('Usuario no encontrado después del login.');
      }
      
      this.#toast.success('¡Inicio de sesión exitoso!');

      // --- PASO 2: Obtener el Perfil/Rol de Firestore ---
      console.log('Login exitoso. Obteniendo perfil para uid:', firebaseUser.uid);
      // Usamos firstValueFrom para obtener el rol UNA VEZ.
      // Añadimos tipado explícito aquí para más claridad.
      const userProfile: UserProfile | undefined = await firstValueFrom(this.#userService.getUserProfile(firebaseUser.uid));
      console.log('Perfil obtenido:', userProfile);


      // --- PASO 3: Redirigir según el Rol ---
      if (userProfile?.role === 'admin') {
        console.log('Usuario es Admin. Redirigiendo a /admin...');
        this.#router.navigate(['/admin']); 
      } else {
        console.log('Usuario es Cliente o sin rol definido. Redirigiendo a /');
        this.#router.navigate(['/']); 
      }
      
    } catch (error: any) {
      console.error('Error de login:', error.code, error.message);
      if (error.code === 'auth/invalid-credential' || error.message?.includes('auth/invalid-credential')) { 
        this.loginError.set('Usuario o contraseña incorrectos.');
      } else {
        this.loginError.set('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
      // Asegurarse de quitar el estado de carga en caso de error también
      this.isLoading.set(false); // <--- Mover o añadir esta línea aquí
    } 
    // No necesitamos el 'finally' si manejamos isLoading en el catch
    // finally {
    //   this.isLoading.set(false); // <-- Ya no es necesario aquí si está en el catch
    // }
  }
}