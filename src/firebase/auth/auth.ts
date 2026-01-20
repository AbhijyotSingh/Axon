'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export async function signUpWithEmail(
  auth: Auth,
  firestore: Firestore,
  email: string,
  password: string
) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfileData = {
        email: user.email,
        createdAt: serverTimestamp(),
    };

    const docRef = doc(firestore, 'users', user.uid);

    setDoc(docRef, userProfileData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: userProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return userCredential;
}

export async function signInWithEmail(auth: Auth, email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(auth: Auth) {
    return signOut(auth);
}
