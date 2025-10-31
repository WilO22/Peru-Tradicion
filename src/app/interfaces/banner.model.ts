// src/app/interfaces/banner.model.ts
export interface BannerModel {
  id: string;
  festivity: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  isActive: boolean; // Usaremos esto para encontrar el banner activo
}