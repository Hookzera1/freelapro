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

    // Buscar estatísticas do freelancer
    const [totalProposals, activeProjects, completedProjects, pendingProposals] = await Promise.all([
      prisma.proposal.count({
        where: { userId: user.id }
      }),
      prisma.project.count({
        where: {
          OR: [
            { freelancerId: user.id, status: 'IN_PROGRESS' },
            {
              proposals: {
                some: {
                  userId: user.id,
                  status: 'ACCEPTED'
                }
              },
              status: 'IN_PROGRESS'
            }
          ]
        }
      }),
      prisma.project.count({
        where: {
          OR: [
            { freelancerId: user.id, status: 'COMPLETED' },
            {
              proposals: {
                some: {
                  userId: user.id,
                  status: 'ACCEPTED'
                }
              },
              status: 'COMPLETED'
            }
          ]
        }
      }),
      prisma.proposal.count({
        where: {
          userId: user.id,
          status: 'PENDING'
        }
      })
    ]);

    return NextResponse.json({
      totalProposals,
      activeProjects,
      completedProjects,
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