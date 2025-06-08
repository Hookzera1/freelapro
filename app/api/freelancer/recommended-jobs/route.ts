import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { Project, User } from '@prisma/client';

interface ProjectWithRelations extends Project {
  user: Pick<User, 'id' | 'name' | 'companyName' | 'image'>;
  _count: {
    proposals: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('API /freelancer/recommended-jobs: Iniciando busca de jobs recomendados');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para recommended jobs:', decodedToken.uid);
      
      // Buscar projetos recomendados usando Prisma
      const recommendedProjects = await prisma.project.findMany({
        where: {
          status: 'OPEN',
          companyId: {
            not: decodedToken.uid // Não mostrar projetos próprios
          }
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              userType: true
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
        take: 10 // Limitar a 10 projetos recomendados
      });

      console.log('API: Projetos recomendados encontrados:', recommendedProjects.length);
      
      return NextResponse.json(recommendedProjects);
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar projetos recomendados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}