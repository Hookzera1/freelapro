import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Verificar token com Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);
      
      // Verificar se o usuário ainda existe
      const user = await auth.getUser(decodedToken.uid);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        valid: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 