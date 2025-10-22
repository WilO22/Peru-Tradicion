// src/app/core/models/costume.model.ts

// Esta es nuestra "plantilla" o "molde" para los datos.
// Asegura que TypeScript nos avise si intentamos usar una propiedad que no existe.
export interface Costume {
  id: string; // El ID del documento de Firestore
  name: string;
  region: 'Costa' | 'Sierra' | 'Selva';
  price: number;
  image: string; // Esta será una URL a Firebase Storage
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  description: string;
}