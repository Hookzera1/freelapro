import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('API /jobs GET: Iniciando busca de vagas');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minBudget = searchParams.get('minBudget') || '';
    const maxBudget = searchParams.get('maxBudget') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('API: Parâmetros de busca:', { search, category, minBudget, maxBudget, type, status, page, limit });

    // Construir filtros para Prisma
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    } else {
      where.status = 'OPEN'; // Apenas projetos abertos por padrão
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { technologies: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minBudget) {
      where.budget = { ...where.budget, gte: parseFloat(minBudget) };
    }

    if (maxBudget) {
      where.budget = { ...where.budget, lte: parseFloat(maxBudget) };
    }

    const skip = (page - 1) * limit;

    // Buscar projetos no Prisma
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
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
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ]);

    console.log('API: Vagas encontradas:', projects.length);
    
    return NextResponse.json({
      jobs: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API /jobs POST: Criando vaga');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para criar vaga:', decodedToken.uid);
      
      const data = await request.json();
      console.log('API: Dados recebidos para nova vaga:', data);
      
      const { 
        title, 
        description, 
        budget, 
        deadline,
        scope,
        technologies,
        type,
        level 
      } = data;

      // Validação dos campos obrigatórios
      if (!title || !description || !budget || !deadline) {
        console.log('API: Campos obrigatórios faltando');
        return NextResponse.json(
          { error: 'Todos os campos obrigatórios devem ser preenchidos' },
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

      // Validação da data limite
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
        console.log('API: Data limite inválida');
        return NextResponse.json(
          { error: 'A data limite deve ser uma data válida no futuro' },
          { status: 400 }
        );
      }

      // Criar projeto no Prisma
      const newProject = await prisma.project.create({
        data: {
          title,
          description,
          budget: parseFloat(budget.toString()),
          deadline: deadlineDate,
          scope: scope || '',
          technologies: technologies || '',
          type: type || 'fixed',
          level: level || 'intermediate',
          status: 'OPEN',
          companyId: decodedToken.uid
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
        }
      });

      console.log('API: Vaga criada com sucesso:', newProject.id);
      
      return NextResponse.json({
        success: true,
        job: newProject,
        message: 'Vaga criada com sucesso'
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}