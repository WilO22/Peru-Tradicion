// src/app/core/models/banner.ts

export interface Banner {
  id: string; // ID del documento de Firestore
  festivity: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string; // URL a Firebase Storage
  // Podríamos añadir un campo 'isActive' si quisiéramos controlar cuál se muestra
}