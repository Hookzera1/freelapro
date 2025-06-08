import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const userId = 'ZOk3iGzB8BbjvyzgNvyOcLseWvx2';
    
    // Atualizar no Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        userType: 'company',
        updatedAt: new Date()
      }
    });

    // Atualizar claims no Firebase
    await auth.setCustomUserClaims(userId, {
      userType: 'company'
    });

    return NextResponse.json({
      message: 'Tipo de usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar tipo de usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tipo de usuário' },
      { status: 500 }
    );
  }
} 