// src/app/services/gemini.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

// Tipos para las respuestas de nuestra API
interface CostumeResponse {
  description: string;
}
interface BannerResponse {
  title: string;
  subtitle: string;
}

@Injectable({
  providedIn: 'root',
})
export class Gemini {
  #http = inject(HttpClient);

  generateCostumeDescription(name: string, region: string): Promise<CostumeResponse> {
    // Hacemos un POST a nuestro propio backend
    const observable = this.#http.post<CostumeResponse>(
      '/api/generateCostumeDescription',
      { name, region }
    );
    return firstValueFrom(observable); // Lo convertimos a Promesa
  }

  generateBannerContent(festivity: string): Promise<BannerResponse> {
    // Hacemos un POST a nuestro propio backend
    const observable = this.#http.post<BannerResponse>(
      '/api/generateBannerContent',
      { festivity }
    );
    return firstValueFrom(observable);
  }
}