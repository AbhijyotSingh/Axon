'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext } from 'react';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

export const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export interface FirebaseProviderProps {
  children: React.ReactNode;
  value: FirebaseContextValue;
}

export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={value}>
        {children}
        <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
    const context = useFirebase();
    if (context.app === null) {
        return null;
    }
    return context.app;
}

export function useAuth() {
    const context = useFirebase();
    if (context.auth === null) {
        return null;
    }
    return context.auth;
}

export function useFirestore() {
    const context = useFirebase();
    if (context.firestore === null) {
        return null;
    }
    return context.firestore;
}
