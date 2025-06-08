import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await verifyAuthToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { uid } = await params;

    // Buscar a proposta específica
    const proposal = await prisma.proposal.findUnique({
      where: { id: uid },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            deadline: true,
            companyId: true
          }
        }
      }
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para ver a proposta
    const hasPermission = proposal.userId === decodedToken.uid || 
                         proposal.project?.companyId === decodedToken.uid;

    if (!hasPermission) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(proposal);

  } catch (error) {
    console.error('Erro ao buscar proposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 