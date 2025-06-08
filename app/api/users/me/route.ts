import { NextResponse } from 'next/server';
import { authMiddleware } from '../../auth/middleware';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: authUser } = authResult;
    const userData = await request.json();

    // Atualizar ou criar usuário
    const user = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        image: userData.image,
        companyName: userData.companyName,
        updatedAt: new Date()
      },
      create: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        image: userData.image,
        companyName: userData.companyName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Atualizar claims no Firebase
    await auth.setCustomUserClaims(user.id, {
      userType: user.userType
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    console.log('Buscando usuário:', user.id);

    // Buscar dados do usuário no Prisma
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    console.log('Dados do Prisma:', userData);

    if (!userData) {
      // Se não encontrar no Prisma, criar um novo usuário
      const firebaseUser = await auth.getUser(user.id);
      
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Usuário',
          userType: firebaseUser.customClaims?.userType || 'freelancer',
          image: firebaseUser.photoURL || null,
          companyName: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('Novo usuário criado no Prisma:', newUser);
      return NextResponse.json(newUser);
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 