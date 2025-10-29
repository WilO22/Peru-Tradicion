// src/app/components/header/header.ts
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink], // Importamos RouterLink para usar [routerLink]
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  // Principio (Signals): Usamos un signal para manejar el estado (abierto/cerrado)
  // del menú móvil.
  isMobileMenuOpen = signal(false);
}