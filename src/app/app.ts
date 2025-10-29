// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html', // <-- Usamos el archivo HTML
  styleUrl: './app.css',
})
export class App {
  // Borramos el 'title' que no se usa
}