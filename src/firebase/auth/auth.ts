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

// This is a placeholder domain. In a production app, you would use your own.
const EMAIL_DOMAIN = 'study-buddy.app';


export async function signUpWithUsername(
  auth: Auth,
  firestore: Firestore,
  username: string,
  password: string
) {
    const email = `${username.toLowerCase()}@${EMAIL_DOMAIN}`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfileData = {
        username: username,
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

export async function signInWithUsername(auth: Auth, username: string, password: string) {
    const email = `${username.toLowerCase()}@${EMAIL_DOMAIN}`;
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(auth: Auth) {
    return signOut(auth);
}
