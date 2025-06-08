import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    console.log('Buscando projeto com ID:', id);

    const project = await prisma.project.findUnique({
      where: {
        id: id,
      },
      include: {
        company: {
          select: {
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
    });

    if (!project) {
      console.log('Projeto não encontrado:', id);
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    console.log('Projeto encontrado:', {
      id: project.id,
      title: project.title,
      companyId: project.companyId
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 