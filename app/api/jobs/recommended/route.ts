import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/config/auth';

// GET /api/jobs/recommended - Lista vagas recomendadas baseadas no perfil do freelancer
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca o perfil do freelancer
    const freelancer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        userType: true,
        // Removidos campos que não existem no schema atual
        // skills: true,
        // hourlyRate: true,
        // yearsOfExperience: true,
      },
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Por enquanto, busca todas as vagas abertas
    // TODO: Implementar sistema de skills/matching quando o schema for expandido
    const jobs = await prisma.project.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            image: true,
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limita a 10 vagas recomendadas
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Erro ao buscar vagas recomendadas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vagas recomendadas' },
      { status: 500 }
    );
  }
}