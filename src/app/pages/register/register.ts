// // src/app/pages/register/register.ts
// import { Component, inject, signal } from '@angular/core';
// import { Router, RouterLink } from '@angular/router';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Auth } from '../../services/auth'; // Nuestro servicio Auth
// // 1. Importa el servicio de la LIBRERÍA CORRECTA
// import { HotToastService } from '@ngxpert/hot-toast'; // <-- ¡Nombre corregido!

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   // Principio Standalone: Importamos lo que necesitamos
//   imports: [
//     ReactiveFormsModule,
//     RouterLink
//   ],
//   templateUrl: './register.html',
//   styleUrl: './register.css'
// })
// export class Register {

//   // --- 1. Inyección de Dependencias ---
//   #authService: Auth = inject(Auth);
//   #router: Router = inject(Router);
//   #fb: FormBuilder = inject(FormBuilder);
//   #toast: HotToastService = inject(HotToastService); // 2. Inyéctalo

//   // --- 2. Gestión de Estado con Signals ---
//   isLoading = signal(false);
//   registerError = signal<string | null>(null);

//   // --- 3. Definición del Formulario Reactivo ---
//   registerForm: FormGroup = this.#fb.group({
//     // Usamos los mismos validadores que en el login
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(6)]]
//     // Podríamos añadir un campo 'confirmPassword' con un validador
//     // personalizado, pero lo mantendremos simple por ahora.
//   });

//   async onSubmit() {
//     if (this.registerForm.invalid) {
//       this.registerForm.markAllAsTouched();
//       return;
//     }

//     this.isLoading.set(true);
//     this.registerError.set(null);

//     try {
//       // --- ¡EL GRAN CAMBIO ESTÁ AQUÍ! ---
//       // Llamamos a nuestro método 'register' orquestado
//       await this.#authService.register(
//         this.registerForm.value.email,
//         this.registerForm.value.password
//       );
      
//       // 3. ¡LA MEJORA! Reemplaza 'alert' con el Toast
//       this.#toast.success('¡Registro exitoso! Redirigiendo al login...');
//       this.#router.navigate(['/login']);
      
//     } catch (error: any) {
//       // Manejo de errores de Firebase
//       console.error('Error de registro:', error.code);
      
//       // 4. Mantenemos el error en-línea
//       if (error.code === 'auth/email-already-in-use') {
//         this.registerError.set('Este correo electrónico ya está en uso.');
//       } else {
//         this.registerError.set('Ocurrió un error inesperado al registrar.');
//       }
//     } finally {
//       this.isLoading.set(false);
//     }
//   }
// }

// src/app/pages/register/register.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { HotToastService } from '@ngxpert/hot-toast';

// --- ¡Nuevo! Validador personalizado ---
// Esta es una función que comprueba si dos campos en un formulario son iguales.
// Es la forma moderna de hacer validaciones cruzadas.
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Si los campos aún no existen, o si no coinciden, devolvemos un error.
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordsMismatch: true };
  }

  // Si coinciden, devolvemos 'null' (sin error)
  return null;
}
// --- Fin del Validador ---

@Component({
  selector: 'app-register',
  standalone: true, // <-- Principio: 100% Standalone
  // Importamos ReactiveFormsModule y RouterLink directamente aquí
  imports: [ReactiveFormsModule, RouterLink], 
  templateUrl: './register.html',
})
export class Register {
  // --- Principio: Inyección con inject() ---
  #authService: Auth = inject(Auth);
  #router: Router = inject(Router);
  #fb: FormBuilder = inject(FormBuilder);
  #toast: HotToastService = inject(HotToastService);

  // --- Principio: Gestión de Estado con Signals ---
  isLoading = signal(false);
  registerError = signal<string | null>(null);

  registerForm: FormGroup = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, {
    // Añadimos nuestro validador personalizado al GRUPO del formulario
    validators: passwordsMatchValidator 
  });

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.registerError.set(null);

    try {
      // Extraemos los valores del formulario
      const { email, password } = this.registerForm.value;

      // Llamamos a nuestro servicio de Auth
      // Este método ya crea el usuario en Auth Y en Firestore (gracias a auth.ts)
      await this.#authService.register(email, password);

      this.#toast.success('¡Cuenta creada exitosamente!');

      // Redirigimos al Home (ya estará logueado)
      this.#router.navigate(['/']);

    } catch (error: any) {
      this.isLoading.set(false);
      console.error('Error de registro:', error.code, error.message);

      if (error.code === 'auth/email-already-in-use') {
        this.registerError.set('Este email ya está en uso. Intenta con otro.');
      } else {
        this.registerError.set('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    }
  }
}