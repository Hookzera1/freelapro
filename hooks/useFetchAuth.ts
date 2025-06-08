import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export function useFetchAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const fetchAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    if (loading) {
      throw new Error('Aguardando inicialização da autenticação');
    }

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const response = await fetchWithAuth(url, options);
      
      if (response.status === 401) {
        // Redirecionar para login se necessário
        router.push('/login');
        throw new Error('Sessão expirada');
      }

      return response;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }, [user, loading, router]);

  return { fetchAuth, loading };
}