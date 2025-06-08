import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid, email, name, image, userType } = await request.json();

    if (!uid || !email || !name || !userType) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (userType !== 'freelancer' && userType !== 'company') {
      return NextResponse.json(
        { message: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { id: uid }
        ]
      }
    });

    if (existingUser) {
      // Se o usuário existe mas não tem userType, atualiza
      if (!existingUser.userType) {
        const updatedUser = await prisma.user.update({
          where: { id: uid },
          data: { userType }
        });

        return NextResponse.json({
          message: 'Tipo de usuário atualizado com sucesso',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            image: updatedUser.image,
            userType: updatedUser.userType,
          }
        });
      }

      return NextResponse.json(
        { message: 'Usuário já existe' },
        { status: 400 }
      );
    }

    // Cria o novo usuário
    const user = await prisma.user.create({
      data: {
        id: uid,
        email,
        name,
        image,
        userType,
        emailVerified: new Date(), // Email já verificado pelo provedor social
      }
    });

    // Atualiza os claims do usuário no Firebase
    await auth.setCustomUserClaims(uid, {
      userType: userType
    });

    return NextResponse.json({
      message: 'Registro completado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        userType: user.userType,
      }
    });
  } catch (error) {
    console.error('Erro ao completar registro social:', error);
    return NextResponse.json(
      { message: 'Erro ao processar registro' },
      { status: 500 }
    );
  }
} 