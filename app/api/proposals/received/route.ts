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

    if (user.userType !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem acessar propostas recebidas' },
        { status: 403 }
      );
    }

    // Buscar propostas para os projetos da empresa
    const proposals = await prisma.proposal.findMany({
      where: {
        project: {
          companyId: user.id
        }
      },
      include: {
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
      }
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas recebidas:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 