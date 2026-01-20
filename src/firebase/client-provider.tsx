'use client';
import { initializeFirebase } from './index';
import { FirebaseProvider, type FirebaseContextValue } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  let services: FirebaseContextValue;
  try {
    services = initializeFirebase();
  } catch (error) {
    console.error("Failed to initialize Firebase on the client. Please update src/firebase/config.ts with your project's configuration.", error);
    services = { app: null, auth: null, firestore: null };
  }
  return <FirebaseProvider value={services}>{children}</FirebaseProvider>;
}
