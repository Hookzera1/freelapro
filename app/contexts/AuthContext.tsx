'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser,
  getIdToken,
  setPersistence,
  browserLocalPersistence,
  updateProfile as firebaseUpdateProfile,
  Auth
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// Verificar se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined';

// Verificar se o auth está disponível
const auth = firebaseAuth;
if (isBrowser && !auth) {
  throw new Error('Firebase Auth não está disponível no navegador');
}

// Garantir que auth não é nulo para o TypeScript
const getAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth não está disponível');
  }
  return auth;
};

interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  emailVerified: boolean;
  userType?: 'freelancer' | 'company';
  companyName?: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, userType: 'freelancer' | 'company', companyName?: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  updateProfile: (data: { userType: string; companyName?: string }) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Função para gerenciar o token
  const manageToken = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await getIdToken(firebaseUser, true);
      // Salvar no localStorage
      localStorage.setItem('authToken', token);
      // Salvar nos cookies com httpOnly
      document.cookie = `authToken=${token}; path=/; max-age=2592000; SameSite=Strict`; // 30 dias
      return token;
    } catch (error) {
      console.error('Erro ao gerenciar token:', error);
      throw error;
    }
  };

  // Função para buscar dados do usuário
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    try {
      const token = await manageToken(firebaseUser);

      console.log('AuthContext: Buscando dados do usuário:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email
      });

      const response = await fetch(`/api/users/${encodeURIComponent(firebaseUser.uid)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 404) {
        console.log('AuthContext: Usuário não encontrado no banco, criando perfil automaticamente...');
        
        // Criar perfil do usuário automaticamente
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email,
            userType: 'freelancer', // Tipo padrão
            emailVerified: firebaseUser.emailVerified
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.text();
          console.error('AuthContext: Erro ao criar perfil:', errorData);
          throw new Error(`Erro ao criar perfil do usuário: ${createResponse.status}`);
        }

        const userData = await createResponse.json();
        console.log('AuthContext: Perfil criado com sucesso:', userData);
        
        return {
          id: userData.uid,
          uid: userData.uid,
          email: userData.email,
          emailVerified: firebaseUser.emailVerified,
          userType: userData.userType,
          companyName: userData.companyName,
          name: userData.name
        };
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('AuthContext: Erro na resposta da API:', errorData);
        throw new Error(`Erro ao buscar dados do usuário: ${response.status}`);
      }

      const userData = await response.json();
      console.log('AuthContext: Dados do usuário obtidos:', userData);

      // Garantir que o userType seja válido
      const validUserType = userData && ['company', 'freelancer'].includes(userData.userType) 
        ? userData.userType 
        : 'freelancer';

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        userType: validUserType,
        companyName: userData.companyName,
        name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário'
      };

      return authUser;
    } catch (error) {
      console.error('AuthContext: Erro ao buscar/criar dados do usuário:', error);
      throw new Error('Erro ao obter perfil do usuário. Tente novamente.');
    }
  };

  useEffect(() => {
    console.log('AuthContext: Inicializando listener de autenticação');
    let isMounted = true;

    // Configurar persistência local
    setPersistence(getAuth(), browserLocalPersistence)
      .then(() => {
        console.log('AuthContext: Persistência local configurada');
      })
      .catch((error) => {
        console.error('AuthContext: Erro ao configurar persistência:', error);
      });

    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      try {
        if (!isMounted) return;
        setLoading(true);

        if (firebaseUser) {
          console.log('AuthContext: Usuário autenticado no Firebase:', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified
          });

          try {
            const userData = await fetchUserData(firebaseUser);
            if (!isMounted) return;
            
            console.log('AuthContext: Dados do usuário obtidos:', {
              uid: userData.uid,
              email: userData.email,
              userType: userData.userType,
              emailVerified: userData.emailVerified
            });
            
            setUser(userData);
            setError(null);
          } catch (error) {
            console.error('AuthContext: Erro ao buscar dados do usuário:', error);
            if (!isMounted) return;
            setUser(null);
            setError('Falha ao carregar dados do usuário');
            // Limpar tokens em caso de erro
            localStorage.removeItem('authToken');
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        } else {
          console.log('AuthContext: Nenhum usuário autenticado no Firebase');
          if (!isMounted) return;
          setUser(null);
          setError(null);
          // Limpar tokens quando não há usuário
          localStorage.removeItem('authToken');
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('AuthContext: Loading finalizado, estado atual:', {
            userPresent: !!user,
            loading: false
          });
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('AuthContext: Iniciando processo de login');

      // 1. Login no Firebase
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      console.log('AuthContext: Login Firebase bem-sucedido');

      // 2. Buscar dados do usuário
      try {
        const userData = await fetchUserData(userCredential.user);
        setUser(userData);

        // 3. Redirecionar para a tela principal
        router.push('/');
      } catch (error) {
        console.error('AuthContext: Erro ao buscar dados do usuário após login:', error);
        setUser(null);
        throw new Error('Falha ao carregar dados do usuário. Por favor, tente novamente.');
      }
    } catch (error: any) {
      console.error('AuthContext: Erro no login Firebase:', error);
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha inválidos';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Login com email/senha não está habilitado. Por favor, contate o suporte.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas de login. Por favor, tente novamente mais tarde.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          break;
        default:
          errorMessage = 'Erro ao fazer login. Por favor, tente novamente.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, userType: 'freelancer' | 'company', companyName?: string) => {
    try {
      setError(null);
      console.log('Iniciando processo de registro...', { email, userType, companyName });

      // Criar usuário no Firebase
      console.log('Tentando criar usuário no Firebase Auth...');
      const result = await createUserWithEmailAndPassword(getAuth(), email, password);
      console.log('Usuário criado no Firebase:', result.user.uid);

      try {
        // Atualizar o displayName do usuário
        console.log('Atualizando displayName...');
        await firebaseUpdateProfile(result.user, { displayName: name });
        console.log('DisplayName atualizado com sucesso');
        
        // Criar perfil do usuário na API
        console.log('Obtendo token para criação do perfil...');
        const token = await result.user.getIdToken();
        console.log('Token obtido, comprimento:', token.length);

        console.log('Enviando requisição para criar perfil...');
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: result.user.uid,
            name,
            email,
            userType,
            companyName
          })
        });

        const responseData = await response.json();
        console.log('Resposta da API de criação de perfil:', responseData);

        if (!response.ok) {
          console.error('Erro na resposta da API:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          });
          throw new Error(responseData.error || 'Erro ao criar perfil do usuário');
        }

        // Enviar email de verificação
        console.log('Enviando email de verificação...');
        await sendEmailVerification(result.user);
        console.log('Email de verificação enviado');

        // Buscar dados atualizados do usuário
        console.log('Buscando dados atualizados do usuário...');
        const userData = await fetchUserData(result.user);
        console.log('Dados do usuário obtidos:', userData);
        return userData;
      } catch (error) {
        console.error('Erro ao configurar perfil:', error);
        // Se falhar ao criar o perfil, deletar o usuário do Firebase
        console.log('Deletando usuário do Firebase devido a erro...');
        await result.user.delete();
        throw error;
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tratamento específico para erros do Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email já está sendo usado por outra conta');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Iniciando logout');
      await firebaseSignOut(getAuth());
      console.log('AuthContext: Logout bem-sucedido');
      router.push('/login');
    } catch (error) {
      console.error('AuthContext: Erro no logout:', error);
      throw new Error('Erro ao fazer logout');
    }
  };

  const updateProfile = async (data: { userType: string; companyName?: string }) => {
    const currentUser = getAuth().currentUser;
    if (!user || !currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const token = await getIdToken(currentUser);
      const response = await fetch(`/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const updatedUserData = await fetchUserData(currentUser);
      setUser(updatedUserData);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
    }
  };

  const sendVerificationEmail = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      await sendEmailVerification(currentUser);
    } catch (err: any) {
      console.error('Erro ao enviar email de verificação:', err);
      setError(err.message || 'Erro ao enviar email de verificação');
    }
  };

  const getAuthToken = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      return null;
    }

    try {
      const token = await getIdToken(currentUser);
      return token;
    } catch (error) {
      console.error('Erro ao obter token de autenticação:', error);
      return null;
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    logout,
    updateProfile,
    sendVerificationEmail,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 