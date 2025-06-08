import { NextResponse } from 'next/server';
import { authMiddleware } from '../auth/middleware';
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
        { error: 'Apenas empresas podem acessar estas estatísticas' },
        { status: 403 }
      );
    }

    // Buscar estatísticas
    const [
      totalProjects,
      activeProjects,
      totalProposals,
      pendingProposals
    ] = await Promise.all([
      // Total de projetos da empresa
      prisma.project.count({
        where: { companyId: user.id }
      }),
      // Projetos ativos
      prisma.project.count({
        where: {
          companyId: user.id,
          status: 'IN_PROGRESS'
        }
      }),
      // Total de propostas para projetos da empresa
      prisma.proposal.count({
        where: {
          project: {
            companyId: user.id
          }
        }
      }),
      // Propostas pendentes para projetos da empresa
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