// src/app/interfaces/costume.model.ts

export type CostumeRegion = 'Costa' | 'Sierra' | 'Selva';
export type CostumeSize = 'S' | 'M' | 'L' | 'XL';

// RENOMBRAMOS LA INTERFAZ
export interface CostumeModel {
  id: string; // Firestore gestionará esto, pero el modelo lo necesita
  name: string;
  region: CostumeRegion;
  price: number;
  image: string; 
  sizes: CostumeSize[];
  description?: string;
}