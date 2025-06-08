import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido ou formato inválido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Buscar usuário no Firestore
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado no Firestore' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json(
        { error: 'Dados do usuário não encontrados' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já existe no Prisma
    const existingUser = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Usuário já existe no Prisma' },
        { status: 200 }
      );
    }

    // Criar usuário no Prisma
    const prismaUser = await prisma.user.create({
      data: {
        id: decodedToken.uid,
        name: userData.name,
        email: userData.email,
        userType: userData.userType as 'company' | 'freelancer',
        companyName: userData.userType === 'company' ? userData.companyName : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Usuário migrado com sucesso',
      user: prismaUser
    });
  } catch (error) {
    console.error('Erro ao migrar usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao migrar usuário';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 