import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../../../../auth/middleware';

interface Params {
  id: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = await params;

    console.log('Recusando proposta:', id, 'para empresa:', user.id);

    // Verificar se a proposta existe e pertence à empresa
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            companyId: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    if (proposal.project.companyId !== user.id) {
      return NextResponse.json(
        { error: 'Não autorizado - Esta proposta não pertence à sua empresa' },
        { status: 403 }
      );
    }

    if (proposal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta proposta já foi processada' },
        { status: 400 }
      );
    }

    // Atualizar status da proposta para REJECTED
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    console.log('Proposta recusada com sucesso:', updatedProposal.id);

    return NextResponse.json({
      message: 'Proposta recusada com sucesso',
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error('Erro ao recusar proposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 