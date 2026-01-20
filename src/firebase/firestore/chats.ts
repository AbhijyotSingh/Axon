'use client';
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
  type Firestore,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Message } from '@/components/chat/chat-view';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export type ChatSession = {
  id: string;
  history: Message[];
  createdAt: any;
  updatedAt: any;
};

export function createChatSession(firestore: Firestore, userId: string) {
    const newChatData = {
        userId: userId,
        history: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const collectionRef = collection(firestore, `users/${userId}/chats`);
    
    addDoc(collectionRef, newChatData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: newChatData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function updateChatSession(
  firestore: Firestore,
  userId: string,
  chatId: string,
  history: Message[]
) {
  const chatRef = doc(firestore, `users/${userId}/chats`, chatId);
  const updatedData = {
    history: history,
    updatedAt: serverTimestamp(),
  };
  
  updateDoc(chatRef, updatedData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: chatRef.path,
        operation: 'update',
        requestResourceData: updatedData,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function getChatsListener(
    firestore: Firestore,
    userId: string,
    callback: (chats: ChatSession[]) => void
) {
    const chatsRef = collection(firestore, `users/${userId}/chats`);
    const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as ChatSession));
        callback(chats);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: chatsRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return unsubscribe;
}
