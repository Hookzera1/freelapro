import { auth } from './firebase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const token = await user.getIdToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    console.error('Erro ao fazer requisição autenticada:', error);
    throw error;
  }
}