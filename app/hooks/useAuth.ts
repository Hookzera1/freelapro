'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useFirebaseAuth } from './useFirebaseAuth';

interface AuthUser extends FirebaseUser {
  userType?: string;
  image?: string | null;
  name?: string | null;
}

interface UpdateProfileData {
  userType: 'freelancer' | 'company';
  companyName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseAuth = useFirebaseAuth();

  useEffect(() => {
    if (firebaseAuth.user) {
      setUser(firebaseAuth.user as AuthUser);
    } else {
      setUser(null);
    }
    setLoading(firebaseAuth.loading);
  }, [firebaseAuth.user, firebaseAuth.loading]);

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const token = await user.getIdToken();
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      // Atualizar o usuário local com os novos dados
      const updatedUser = { ...user, userType: data.userType };
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    updateProfile,
    signIn: firebaseAuth.signIn,
    signUp: firebaseAuth.signUp,
    signInWithGoogle: firebaseAuth.signInWithGoogle,
    signOut: firebaseAuth.signOut,
    error: firebaseAuth.error
  };
} 