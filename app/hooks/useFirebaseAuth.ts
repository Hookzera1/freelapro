'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { User } from '../types/auth';
import { auth } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();

export function useFirebaseAuth() {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar dados adicionais do usuário do nosso banco
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(`/api/users/${encodeURIComponent(firebaseUser.uid)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const userData = await response.json();
          setUser({ ...firebaseUser, userType: userData.userType } as User);
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          setUser(firebaseUser as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user as User;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const signUp = async (email: string, password: string, userData?: { userType: string; name: string }) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Salvar dados adicionais do usuário no banco de dados
      if (userData) {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userCredential.user.uid,
            email: email,
            name: userData.name,
            userType: userData.userType,
          }),
        });
      }

      return userCredential.user as User;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Criar ou atualizar usuário no banco de dados
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          userType: 'freelancer', // Tipo padrão para login com Google
          image: result.user.photoURL,
        }),
      });

      return result.user as User;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    error,
  };
} 