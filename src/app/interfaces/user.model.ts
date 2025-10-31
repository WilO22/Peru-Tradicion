// src/app/interfaces/user.model.ts
export type UserRole = 'admin' | 'cliente';

export interface UserModel {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string; // Opcional
  photoURL?: string; // Opcional
}