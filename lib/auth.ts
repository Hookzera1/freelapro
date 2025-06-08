import { auth } from './firebase-admin';
import { NextRequest } from 'next/server';

export async function getServerAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Erro de autenticação: Cabeçalho Authorization ausente ou inválido');
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.error('Erro de autenticação: Token não encontrado no cabeçalho Authorization');
      return null;
    }

    const decodedToken = await auth.verifyIdToken(token);
    console.log('Autenticação bem-sucedida para usuário:', decodedToken.uid);
    
    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name
      }
    };
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return null;
  }
}

export async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}