import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('API /users/me GET: Iniciando busca de usuário atual');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para user/me:', decodedToken.uid);
      
      // Buscar dados do usuário no PostgreSQL
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          companyName: true,
          image: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        console.log('API: Usuário não encontrado no PostgreSQL, criando...');
        
        // Criar usuário no PostgreSQL se não existir
        const firebaseUser = await auth.getUser(decodedToken.uid);
        const newUser = await prisma.user.create({
          data: {
            id: decodedToken.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Usuário',
            userType: 'freelancer',
            image: firebaseUser.photoURL || null,
          }
        });

        console.log('API: Novo usuário criado no PostgreSQL');
        
        return NextResponse.json({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          userType: newUser.userType,
          companyName: newUser.companyName,
          image: newUser.image
        });
      }

      console.log('API: Dados do usuário obtidos com sucesso');
      
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        companyName: user.companyName,
        image: user.image
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('API: Erro na rota /users/me:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 