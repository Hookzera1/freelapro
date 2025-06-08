import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../../auth/middleware';

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    console.log('Buscando projetos para empresa:', user.id);

    // Verificar se o usuário é uma empresa
    if (user.userType !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem acessar seus projetos' },
        { status: 403 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        companyId: user.id,
      },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
        company: {
          select: {
            name: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Projetos encontrados:', projects.length);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
} 