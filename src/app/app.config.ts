// src/app/app.config.ts

import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsPE from '@angular/common/locales/es-PE';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
// 👇 Importa provideHttpClient y withFetch
import { provideHttpClient, withFetch } from '@angular/common/http';
// 👇 Importa provideAnimations
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes'; // Asegúrate que esta ruta sea correcta
import { environment } from '../environments/environment.development'; // Asegúrate que esta ruta sea correcta
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Registra el locale ANTES de la configuración
registerLocaleData(localeEsPE, 'es-PE');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // Firebase Providers
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    // Proveedor para LOCALE_ID
    { provide: LOCALE_ID, useValue: 'es-PE' },

    // 👇 Añade estos dos proveedores
    provideHttpClient(withFetch()), // Para futuras APIs y Storage
    provideAnimations() // Para animaciones (útil para el modal)
  ]
};