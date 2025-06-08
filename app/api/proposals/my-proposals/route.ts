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

    // Buscar propostas do usuário
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
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Propostas encontradas:', proposals.length);
    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}