// src/app/components/public-banner.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para @if y [style.background-image]
import { Banner } from '../../services/banner';

@Component({
  selector: 'app-public-banner',
  standalone: true,
  imports: [CommonModule], // ¡Importante!
  templateUrl: './public-banner.html',
})
export class PublicBanner {
  #bannerService = inject(Banner);

  // Simplemente exponemos el Signal del servicio
  activeBanner = this.#bannerService.activeBanner;
}