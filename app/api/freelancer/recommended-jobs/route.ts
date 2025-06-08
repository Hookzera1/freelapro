import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../../auth/middleware';
import { Project, User } from '@prisma/client';

interface ProjectWithRelations extends Project {
  user: Pick<User, 'id' | 'name' | 'companyName' | 'image'>;
  _count: {
    proposals: number;
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

    if (user.userType !== 'freelancer') {
      return NextResponse.json(
        { error: 'Apenas freelancers podem acessar estas vagas' },
        { status: 403 }
      );
    }

    // Buscar projetos abertos
    const projects = await prisma.project.findMany({
      where: {
        status: 'OPEN',
        // Não mostrar projetos próprios
        companyId: { not: user.id }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            image: true
          }
        },
        _count: {
          select: {
            proposals: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Formatar os dados para o frontend
    const formattedProjects = projects.map((project) => ({
      ...project,
      technologies: project.technologies ? project.technologies.split(',').map((s: string) => s.trim()) : [],
      company: {
        name: project.company.companyName || project.company.name,
        image: project.company.image
      }
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Erro ao buscar projetos recomendados:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}