import { NextResponse } from 'next/server';
import { authMiddleware } from '../../../auth/middleware';
import { prisma } from '@/lib/prisma';

interface ProposalResponse {
  id: string;
  status: string;
  value: number;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    user: {
      name: string;
      companyName: string | null;
    };
  };
}

interface FormattedProposal {
  id: string;
  status: string;
  value: number;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
      companyName: string | null;
    };
  };
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

    // Buscar propostas recentes do freelancer
    const proposals = await prisma.proposal.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            budget: true,
            deadline: true,
            company: {
              select: {
                id: true,
                name: true,
                companyName: true,
                image: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas recentes:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 