import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export function useFetchAuth() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const fetchAuth = async (url: string, options: RequestInit = {}) => {
    try {
      if (!isAuthenticated || !user) {
        console.log('useFetchAuth: Usuário não autenticado');
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        throw new Error('Usuário não autenticado');
      }

      // Obter token do localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('useFetchAuth: Token não encontrado');
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        throw new Error('Token não encontrado');
      }

      // Verificar se o token está próximo de expirar
      if (isTokenExpired(token)) {
        console.log('useFetchAuth: Token próximo de expirar, obtendo novo token');
        // Obter um novo token do usuário atual do Firebase
        if (!auth) {
          console.log('useFetchAuth: Firebase Auth não está disponível');
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          throw new Error('Firebase Auth não está disponível');
        }
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          localStorage.setItem('authToken', newToken);
        } else {
          console.log('useFetchAuth: Usuário Firebase não encontrado');
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          throw new Error('Usuário Firebase não encontrado');
        }
      }

      // Mesclar headers
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);

      const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store'
      });

      if (response.status === 401) {
        // Tentar obter um novo token do Firebase
        if (!auth) {
          console.log('useFetchAuth: Firebase Auth não está disponível para retry');
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          throw new Error('Firebase Auth não está disponível');
        }
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          localStorage.setItem('authToken', newToken);
          
          // Tentar novamente com o novo token
          headers.set('Authorization', `Bearer ${newToken}`);
          const retryResponse = await fetch(url, {
            ...options,
            headers,
            cache: 'no-store'
          });

          if (retryResponse.ok) {
            return retryResponse;
          }
        }

        console.log('useFetchAuth: Token expirado ou inválido');
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        throw new Error('Sessão expirada');
      }

      if (!response.ok) {
        console.error('useFetchAuth: Erro na requisição', response.status);
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return response;
    } catch (error) {      
      console.error('Erro na requisição em useFetchAuth:', error);
      throw error;
    }
  };

  return { fetchAuth };
}

// Função para verificar se o token está próximo de expirar
function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    const expirationTime = decodedPayload.exp * 1000; // Converter para milissegundos
    const currentTime = Date.now();
    const timeToExpire = expirationTime - currentTime;
    
    // Retorna true se o token expira em menos de 5 minutos
    return timeToExpire < 300000;
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error);
    return true; // Em caso de erro, assume que o token está expirado
  }
}