import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "peru-tradicion-c26e2", appId: "1:692450878113:web:361fbabd983b2a352146e0", storageBucket: "peru-tradicion-c26e2.firebasestorage.app", apiKey: "AIzaSyCupzIWND9s9QcBTR3MgLS3ZqCAPR6kFxk", authDomain: "peru-tradicion-c26e2.firebaseapp.com", messagingSenderId: "692450878113", projectNumber: "692450878113", version: "2" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())
  ]
};
