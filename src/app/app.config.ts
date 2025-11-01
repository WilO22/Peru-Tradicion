// src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection, // <-- El nombre correcto (estable) que tú descubriste
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// --- 1. Importar el proveedor de HttpClient ---
import { provideHttpClient, withFetch } from '@angular/common/http';

// Nuestro refactor de environment
import { environment } from '../environments/environment.development';

// Imports de Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

// 1. Importa el proveedor de la LIBRERÍA CORRECTA
import { provideHotToastConfig, ToastOptions } from '@ngxpert/hot-toast'; // <-- ¡Nombre corregido!

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // <-- Lo mantenemos, es una buena práctica de la CLI
    provideZonelessChangeDetection(),     // <-- ¡El proveedor correcto!
    provideRouter(routes),
    provideClientHydration(withEventReplay()), // <-- Lo mantenemos, optimiza el SSR

    // --- 2. Añadir el proveedor aquí ---
    provideHttpClient(withFetch()), // <-- Habilita HttpClient moderno

    // 2. Añádelo a tu lista de providers
    provideHotToastConfig({
      position: 'bottom-center', // <-- ¡Nuestra nueva posición por defecto!
      // Aquí podrías añadir otras opciones globales si quisieras,
      // como duración, colores, etc. Consulta la documentación de la librería.
    }), // <-- ¡Nombre corregido!

    // Proveedores de Firebase con nuestro environment
    provideFirebaseApp(() =>
      initializeApp(environment.firebase) // <-- Usando nuestro environment refactorizado
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};