import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../auth/middleware';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    console.log('=== API JOBS GET - Buscando projetos ===');
    console.log('Filtro: status = OPEN');
    console.log('Limit:', limit);
    
    const projects = await prisma.project.findMany({
      take: limit,
      where: {
        status: 'OPEN'
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Projetos encontrados:', projects.length);
    projects.forEach(project => {
      console.log(`- Projeto ${project.id}: "${project.title}" - Status: ${project.status} - ${project._count.proposals} propostas`);
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    console.log('API Jobs - Criando projeto - Dados do usuário:', {
      userId: user.id,
      userType: user.userType,
      hasUser: !!user
    });

    if (user.userType !== 'company') {
      console.log('API Jobs - Erro: Usuário não é empresa:', user.userType);
      return NextResponse.json(
        { error: 'Apenas empresas podem criar projetos' },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log('API Jobs - Dados recebidos:', data);
    
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
      console.log('API Jobs - Erro: Campos obrigatórios faltando:', {
        hasTitle: !!title,
        hasDescription: !!description,
        hasBudget: !!budget,
        hasDeadline: !!deadline
      });
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    // Validação do orçamento
    if (isNaN(budget) || budget <= 0) {
      console.log('API Jobs - Erro: Orçamento inválido:', budget);
      return NextResponse.json(
        { error: 'O orçamento deve ser um valor numérico positivo' },
        { status: 400 }
      );
    }

    // Validação da data limite
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
      console.log('API Jobs - Erro: Data limite inválida:', {
        deadline,
        deadlineDate,
        isValid: !isNaN(deadlineDate.getTime()),
        isFuture: deadlineDate > new Date()
      });
      return NextResponse.json(
        { error: 'A data limite deve ser uma data válida no futuro' },
        { status: 400 }
      );
    }

    console.log('API Jobs - Criando projeto no banco de dados');
    // Criar o projeto
    const project = await prisma.project.create({
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
        companyId: user.id,
      },
      include: {
        company: {
          select: {
            name: true,
            companyName: true,
            image: true,
          },
        },
      },
    });

    console.log('API Jobs - Projeto criado com sucesso:', {
      projectId: project.id,
      companyId: user.id
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('API Jobs - Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto. Tente novamente.' },
      { status: 500 }
    );
  }
}