'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export { FirebaseProvider, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';


type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let services: FirebaseServices | null = null;

export function initializeFirebase(): FirebaseServices {
    if (typeof window === 'undefined') {
        throw new Error('Firebase can only be initialized on the client side.');
    }

    if (services) {
        return services;
    }
    
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('PASTE_YOUR_FIREBASE')) {
        throw new Error('Firebase API Key is missing. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your .env file.');
    }

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    services = { app, auth, firestore };
    return services;
}
