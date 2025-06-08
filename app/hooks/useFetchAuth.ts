import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export function useFetchAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, getAuthToken } = useAuth();

  const fetchAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      if (!isAuthenticated || !user) {
        console.log('🔐 useFetchAuth: Usuário não autenticado');
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        throw new Error('Usuário não autenticado');
      }

      // Obter token atualizado do contexto
      console.log('🔐 useFetchAuth: Obtendo token do contexto...');
      const token = await getAuthToken();
      if (!token) {
        console.log('🔐 useFetchAuth: Token não disponível');
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        throw new Error('Token não disponível');
      }

      // Configurar headers
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);
      if (!headers.get('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      console.log('🔐 useFetchAuth: Fazendo requisição para:', url);
      const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store'
      });

      if (response.status === 401) {
        console.log('🔐 useFetchAuth: Token expirado, tentando renovar...');
        
        // Tentar obter novo token
        const newToken = await getAuthToken();
        if (!newToken) {
          console.log('🔐 useFetchAuth: Não foi possível renovar token');
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          throw new Error('Sessão expirada');
        }

        // Tentar novamente com novo token
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          cache: 'no-store'
        });

        if (retryResponse.ok) {
          console.log('🔐 useFetchAuth: Requisição bem-sucedida após renovação do token');
          return retryResponse;
        }

        console.log('🔐 useFetchAuth: Falha mesmo após renovar token');
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        throw new Error('Sessão expirada');
      }

      if (!response.ok) {
        console.error('🔐 useFetchAuth: Erro na requisição:', response.status, response.statusText);
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      console.log('🔐 useFetchAuth: Requisição bem-sucedida');
      return response;
    } catch (error) {      
      console.error('🔐 useFetchAuth: Erro na requisição:', error);
      throw error;
    }
  }, [user?.uid, isAuthenticated, getAuthToken, router, pathname]);

  return { fetchAuth };
}