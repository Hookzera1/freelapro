import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('API /proposals GET: Iniciando busca de propostas');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para propostas:', decodedToken.uid);
      
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || '';
      const projectId = searchParams.get('projectId') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      console.log('API: Parâmetros de busca:', { status, projectId, page, limit });

      // Construir filtros para Prisma
      const where: any = {};
      
      if (status && status !== 'all') {
        where.status = status.toUpperCase();
      }

      if (projectId) {
        where.projectId = projectId;
      }

      // Filtrar por usuário logado
      where.userId = decodedToken.uid;

      const skip = (page - 1) * limit;

      // Buscar propostas no Prisma
      const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            project: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.proposal.count({ where })
      ]);

      console.log('API: Propostas encontradas:', proposals.length);
      
      return NextResponse.json({
        proposals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API /proposals POST: Criando proposta');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para criar proposta:', decodedToken.uid);
      
      const data = await request.json();
      console.log('API: Dados recebidos para nova proposta:', data);
      
      const { 
        projectId,
        message,
        budget
      } = data;

      // Validação dos campos obrigatórios
      if (!projectId || !message || !budget) {
        console.log('API: Campos obrigatórios faltando');
        return NextResponse.json(
          { error: 'Projeto ID, mensagem e orçamento são obrigatórios' },
          { status: 400 }
        );
      }

      // Validação do orçamento
      if (isNaN(budget) || budget <= 0) {
        console.log('API: Orçamento inválido:', budget);
        return NextResponse.json(
          { error: 'O orçamento deve ser um valor numérico positivo' },
          { status: 400 }
        );
      }

      // Verificar se o projeto existe
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Projeto não encontrado' },
          { status: 404 }
        );
      }

      if (project.status !== 'OPEN') {
        return NextResponse.json(
          { error: 'Este projeto não está mais aceitando propostas' },
          { status: 400 }
        );
      }

      // Verificar se o usuário já enviou uma proposta para este projeto
      const existingProposal = await prisma.proposal.findFirst({
        where: {
          userId: decodedToken.uid,
          projectId: projectId
        }
      });

      if (existingProposal) {
        return NextResponse.json(
          { error: 'Você já enviou uma proposta para este projeto' },
          { status: 400 }
        );
      }

      // Criar proposta no Prisma
      const newProposal = await prisma.proposal.create({
        data: {
          userId: decodedToken.uid,
          projectId,
          message,
          budget: parseFloat(budget.toString()),
          status: 'PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          project: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      console.log('API: Proposta criada com sucesso:', newProposal.id);
      
      return NextResponse.json({
        success: true,
        proposal: newProposal,
        message: 'Proposta enviada com sucesso'
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}