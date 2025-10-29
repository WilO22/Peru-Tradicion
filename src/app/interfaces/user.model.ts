// src/app/interfaces/user.model.ts

// Usamos un 'type' para definir los roles permitidos
export type UserRole = 'admin' | 'cliente';

// Esta es la "forma" que tendrán nuestros documentos
// en la colección 'users' de Firestore
export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string; // Opcional
}