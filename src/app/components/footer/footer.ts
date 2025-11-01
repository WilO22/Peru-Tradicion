// src/app/components/footer/footer.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Costume } from '../../services/costume';
import { CostumeRegion } from '../../interfaces/costume.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
})
export class Footer {
  #costumeService = inject(Costume);
  #router = inject(Router);

  // ¡Nueva Lógica!
  // Navega a Home y aplica el filtro de región
  async filterByRegion(region: CostumeRegion | 'Todos') {
    // 1. Navega a la página de inicio
    await this.#router.navigate(['/']);

    // 2. Llama al servicio para cambiar la región
    this.#costumeService.changeRegion(region);

    // 3. (Opcional) Sube al inicio de la página
    window.scrollTo(0, 0);
  }
}