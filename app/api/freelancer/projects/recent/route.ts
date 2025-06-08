import { NextResponse } from 'next/server';
import { authMiddleware } from '../../../auth/middleware';
import { prisma } from '@/lib/prisma';

interface ProjectResponse {
  id: string;
  title: string;
  status: string;
  budget: number;
  deadline: Date;
  user: {
    name: string;
    companyName: string | null;
  };
}

interface FormattedProject {
  id: string;
  title: string;
  status: 'active' | 'completed';
  company: {
    name: string;
  };
  budget: number;
  deadline: Date;
}

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Verificar se o usuário existe e é freelancer
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userData || userData.userType !== 'freelancer') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Buscar projetos recentes do freelancer
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          {
            freelancerId: user.id
          },
          {
            proposals: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      include: {
        company: {
          select: {
            name: true,
            companyName: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos recentes:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 