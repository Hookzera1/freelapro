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
        { error: 'Apenas empresas podem acessar estas vagas' },
        { status: 403 }
      );
    }

    const recentJobs = await prisma.project.findMany({
      where: { 
        companyId: user.id 
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            proposals: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json(recentJobs);
  } catch (error) {
    console.error('Erro ao buscar vagas recentes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vagas' },
      { status: 500 }
    );
  }
}