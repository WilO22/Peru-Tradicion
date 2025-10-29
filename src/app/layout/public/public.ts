// src/app/layout/public/public.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// 1. Importa los componentes que acabamos de crear
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-public',
  standalone: true,
  // 2. Añádelos al array de 'imports'
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './public.html',
  styleUrl: './public.css'
})
export class Public {

}