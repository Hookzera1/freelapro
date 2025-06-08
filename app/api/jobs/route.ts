import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

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

    // Por enquanto, retornar dados mock para evitar erros
    // TODO: Implementar com Firestore futuramente
    const mockJobs = [
      {
        id: '1',
        title: 'Desenvolvimento de E-commerce',
        description: 'Preciso desenvolver uma loja virtual completa com sistema de pagamento integrado.',
        budget: 5000,
        type: 'fixed',
        category: 'desenvolvimento-web',
        status: 'open',
        skills: ['React', 'Node.js', 'E-commerce', 'Stripe'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        company: {
          id: 'comp1',
          name: 'Tech Solutions Ltda',
          rating: 4.5,
          reviewsCount: 12
        },
        proposalsCount: 8,
        location: 'São Paulo, SP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Design de Logo e Identidade Visual',
        description: 'Criação de logo e identidade visual completa para startup de tecnologia.',
        budget: 1500,
        type: 'fixed',
        category: 'design',
        status: 'open',
        skills: ['Logo Design', 'Branding', 'Adobe Illustrator', 'Photoshop'],
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        company: {
          id: 'comp2',
          name: 'StartUp Inovadora',
          rating: 4.8,
          reviewsCount: 5
        },
        proposalsCount: 15,
        location: 'Rio de Janeiro, RJ',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Aplicativo Mobile para Delivery',
        description: 'Desenvolvimento de app mobile para delivery de comida com GPS e notificações.',
        budget: 8000,
        type: 'fixed',
        category: 'desenvolvimento-mobile',
        status: 'open',
        skills: ['React Native', 'Firebase', 'Maps API', 'Push Notifications'],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        company: {
          id: 'comp3',
          name: 'Food Express',
          rating: 4.2,
          reviewsCount: 8
        },
        proposalsCount: 12,
        location: 'Belo Horizonte, MG',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Simular filtros simples
    let filteredJobs = mockJobs;
    
    if (search) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.category === category);
    }

    if (type && type !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    if (minBudget) {
      const min = parseInt(minBudget);
      filteredJobs = filteredJobs.filter(job => job.budget >= min);
    }

    if (maxBudget) {
      const max = parseInt(maxBudget);
      filteredJobs = filteredJobs.filter(job => job.budget <= max);
    }

    // Simular paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    console.log('API: Vagas obtidas com sucesso (mock):', paginatedJobs.length, 'resultados');
    
    return NextResponse.json({
      jobs: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / limit)
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

      // Por enquanto, apenas simular a criação
      // TODO: Implementar com Firestore futuramente
      const newJob = {
        id: `job_${Date.now()}`,
        title,
        description,
        budget: parseFloat(budget.toString()),
        deadline: deadlineDate.toISOString(),
        scope: scope || '',
        technologies: technologies || '',
        type: type || 'fixed',
        level: level || 'intermediate',
        status: 'open',
        companyId: decodedToken.uid,
        company: {
          id: decodedToken.uid,
          name: 'Empresa Usuário',
          rating: 5.0,
          reviewsCount: 0
        },
        proposalsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('API: Vaga criada com sucesso (mock):', newJob.id);
      
      return NextResponse.json({
        success: true,
        job: newJob,
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