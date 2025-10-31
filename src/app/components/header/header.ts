// // src/app/components/header/header.ts

// import { Component, inject } from '@angular/core';
// import { Router, RouterLink } from '@angular/router'; // Importa RouterLink
// import { Auth } from '../../services/auth';
// import { Costume } from '../../services/costume'; // <-- 1. Importar el servicio
// import { CostumeRegion } from '../../interfaces/costume.model'; // <-- 2. Importar el tipo

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [RouterLink], // <-- 3. Asegurarse que RouterLink esté aquí
//   templateUrl: './header.html',
// })
// export class Header {
//   authService = inject(Auth);
//   router = inject(Router);

//   // --- 4. Inyectar el servicio de Disfraces ---
//   costumeService = inject(Costume);
  
//   // --- 5. Exponer el estado y los métodos a la plantilla ---
//   selectedRegion = this.costumeService.selectedRegion;
  
//   changeRegion(region: CostumeRegion | 'Todos') {
//     this.costumeService.changeRegion(region);
//     // Opcional: Si estás en otra página, navegar al home
//     // this.router.navigate(['/']); 
//   }

//   logout() {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }

// src/app/components/header/header.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para [class.active-nav]
import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { Costume } from '../../services/costume';
import { CostumeRegion } from '../../interfaces/costume.model';

@Component({
  selector: 'app-header',
  standalone: true,
  // ¡Importante! Añadimos CommonModule y RouterLink
  imports: [CommonModule, RouterLink], 
  templateUrl: './header.html',
})
export class Header {
  // --- Principio: Inyección con inject() ---
  authService = inject(Auth);
  userService = inject(User);
  costumeService = inject(Costume);

  // --- Principio: Gestión de Estado con Signals ---
  
  // Exponemos los signals de Auth y User a la plantilla
  currentUser = this.authService.currentUser;
  isAdmin = this.userService.isAdmin;

  // Exponemos el signal de región de Costume
  selectedRegion = this.costumeService.selectedRegion;

  // Signal local para manejar el menú móvil
  isMobileMenuOpen = signal(false);

  // Exponemos los métodos a la plantilla
  
  changeRegion(region: CostumeRegion | 'Todos') {
    this.costumeService.changeRegion(region);
    this.isMobileMenuOpen.set(false); // Cerramos el menú al seleccionar
  }

  logout() {
    this.authService.logout();
    this.isMobileMenuOpen.set(false); // Cerramos el menú al salir
  }
}