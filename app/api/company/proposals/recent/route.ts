import { NextResponse } from 'next/server';
import { authMiddleware } from '../../../auth/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Verificar se o usuário existe e é uma empresa
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userData || userData.userType !== 'company') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Buscar propostas recebidas pela empresa
    const proposals = await prisma.proposal.findMany({
      where: {
        project: {
          company: { id: user.id }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            budget: true,
            deadline: true,
            type: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Retornar no formato esperado pelo frontend
    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 