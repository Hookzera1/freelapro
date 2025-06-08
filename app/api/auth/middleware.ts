import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

interface AuthUser {
  id: string;
  email: string;
  userType: string;
}

export async function authMiddleware(request: Request) {
  try {
    // Obter o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Token não encontrado no header');
      return NextResponse.json(
        { error: 'Não autorizado - Token não encontrado' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Verificar o token com o Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);
      console.log('Token verificado com sucesso:', {
        uid: decodedToken.uid,
        email: decodedToken.email
      });

      // Buscar dados do usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
        select: {
          id: true,
          email: true,
          userType: true
        }
      });

      if (!user) {
        console.error('Usuário não encontrado no banco:', decodedToken.uid);
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Retornar os dados do usuário
      return { user };
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 