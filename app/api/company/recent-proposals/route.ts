import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuth(request);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado - Faça login primeiro' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.userType !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem acessar estas propostas' },
        { status: 403 }
      );
    }

    const recentProposals = await prisma.proposal.findMany({
      where: {
        project: {
          companyId: user.id
        }
      },
      select: {
        id: true,
        budget: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json(recentProposals);
  } catch (error) {
    console.error('Erro ao buscar propostas recentes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}