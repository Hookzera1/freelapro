import { NextResponse } from 'next/server';
import { authMiddleware } from '../../auth/middleware';
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

    // Buscar estatísticas da empresa
    const [totalProjects, activeProjects, totalProposals, pendingProposals] = await Promise.all([
      prisma.project.count({
        where: { 
          companyId: user.id
        }
      }),
      prisma.project.count({
        where: { 
          companyId: user.id,
          status: 'IN_PROGRESS'
        }
      }),
      prisma.proposal.count({
        where: {
          project: {
            companyId: user.id
          }
        }
      }),
      prisma.proposal.count({
        where: {
          project: {
            companyId: user.id
          },
          status: 'PENDING'
        }
      })
    ]);

    return NextResponse.json({
      totalProjects,
      activeProjects,
      totalProposals,
      pendingProposals
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}