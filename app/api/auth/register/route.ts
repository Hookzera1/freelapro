import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { id, name, email, password, userType } = await request.json();

    // Validar dados
    if (!email || !name || !userType) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de usuário
    if (userType !== 'freelancer' && userType !== 'company') {
      return NextResponse.json(
        { message: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    // Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { id: id || undefined }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este usuário já existe' },
        { status: 400 }
      );
    }

    let userId = id;

    // Se não tiver ID (registro normal) e tiver senha, criar usuário no Firebase
    if (!id && password) {
      try {
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: name
        });
        userId = userRecord.uid;

        // Definir claims do usuário
        await auth.setCustomUserClaims(userId, {
          userType: userType
        });
      } catch (firebaseError) {
        console.error('Erro ao criar usuário no Firebase:', firebaseError);
        return NextResponse.json(
          { message: 'Erro ao criar usuário no Firebase' },
          { status: 500 }
        );
      }
    }

    // Criar o usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        userType,
        emailVerified: id ? new Date() : null, // Se tem ID, é registro social
      },
    });

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 