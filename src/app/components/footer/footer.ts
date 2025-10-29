// src/app/components/footer/footer.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink], // Importamos RouterLink
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

}