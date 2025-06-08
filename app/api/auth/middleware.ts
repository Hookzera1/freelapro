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
      let user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true
        }
      });

      if (!user) {
        console.log('Usuário não encontrado no SQLite, criando automaticamente...');
        
        // Criar usuário automaticamente no banco SQLite
        try {
          user = await prisma.user.create({
            data: {
              id: decodedToken.uid,
              email: decodedToken.email || '',
              name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Usuário',
              userType: decodedToken.userType || 'freelancer', // Default para freelancer
            },
            select: {
              id: true,
              email: true,
              name: true,
              userType: true
            }
          });
          
          console.log('Usuário criado com sucesso no SQLite:', user);
        } catch (createError) {
          console.error('Erro ao criar usuário no SQLite:', createError);
          return NextResponse.json(
            { error: 'Erro ao criar usuário no banco' },
            { status: 500 }
          );
        }
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