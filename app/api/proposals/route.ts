import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

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

      // Por enquanto, retornar dados mock para evitar erros
      // TODO: Implementar com Firestore futuramente
      const mockProposals = [
        {
          id: '1',
          projectId: 'proj1',
          freelancerId: decodedToken.uid,
          title: 'Proposta para E-commerce',
          description: 'Proposta detalhada para desenvolvimento do e-commerce solicitado.',
          budget: 4500,
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          coverLetter: 'Tenho experiência sólida em desenvolvimento e-commerce...',
          project: {
            id: 'proj1',
            title: 'Desenvolvimento de E-commerce',
            company: {
              name: 'Tech Solutions Ltda'
            }
          },
          freelancer: {
            id: decodedToken.uid,
            name: 'Freelancer Usuário',
            rating: 4.8
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Simular filtros simples
      let filteredProposals = mockProposals;
      
      if (status && status !== 'all') {
        filteredProposals = filteredProposals.filter(p => p.status === status);
      }

      if (projectId) {
        filteredProposals = filteredProposals.filter(p => p.projectId === projectId);
      }

      // Simular paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProposals = filteredProposals.slice(startIndex, endIndex);

      console.log('API: Propostas obtidas com sucesso (mock):', paginatedProposals.length, 'resultados');
      
      return NextResponse.json({
        proposals: paginatedProposals,
        pagination: {
          page,
          limit,
          total: filteredProposals.length,
          pages: Math.ceil(filteredProposals.length / limit)
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
        title,
        description,
        budget,
        deadline,
        coverLetter
      } = data;

      // Validação dos campos obrigatórios
      if (!projectId || !title || !description || !budget || !deadline) {
        console.log('API: Campos obrigatórios faltando');
        return NextResponse.json(
          { error: 'Todos os campos obrigatórios devem ser preenchidos' },
          { status: 400 }
        );
      }

      // Por enquanto, apenas simular a criação
      // TODO: Implementar com Firestore futuramente
      const newProposal = {
        id: `prop_${Date.now()}`,
        projectId,
        freelancerId: decodedToken.uid,
        title,
        description,
        budget: parseFloat(budget.toString()),
        deadline: new Date(deadline).toISOString(),
        status: 'pending',
        coverLetter: coverLetter || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('API: Proposta criada com sucesso (mock):', newProposal.id);
      
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