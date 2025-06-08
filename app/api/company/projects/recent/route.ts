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

    // Buscar projetos recentes da empresa
    const recentProjects = await prisma.project.findMany({
      where: {
        company: { id: user.id }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        budget: true,
        createdAt: true
      }
    });

    return NextResponse.json(recentProjects);
  } catch (error) {
    console.error('Erro ao buscar projetos recentes:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 