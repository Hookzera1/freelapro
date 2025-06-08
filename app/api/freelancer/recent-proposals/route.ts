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

    if (user.userType !== 'freelancer') {
      return NextResponse.json(
        { error: 'Apenas freelancers podem acessar estas propostas' },
        { status: 403 }
      );
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        userId: user.id
      },
      include: {
        project: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                companyName: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Formatar os dados para o frontend
    const formattedProposals = proposals.map(proposal => ({
      id: proposal.id,
      budget: proposal.budget,
      status: proposal.status,
      createdAt: proposal.createdAt,
      project: {
        id: proposal.project.id,
        title: proposal.project.title,
        company: {
          name: proposal.project.company.companyName || proposal.project.company.name,
          image: proposal.project.company.image
        }
      }
    }));

    return NextResponse.json(formattedProposals);
  } catch (error) {
    console.error('Erro ao buscar propostas recentes:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}