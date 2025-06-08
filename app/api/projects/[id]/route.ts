import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API /projects/[id] GET: Iniciando busca de projeto');
    
    const { id } = await params;
    console.log('API: ID do projeto:', id);

    // Por enquanto, retornar dados mock para evitar erros
    // TODO: Implementar com Firestore futuramente
    const mockProject = {
      id,
      title: 'Desenvolvimento de E-commerce',
      description: 'Desenvolvimento completo de uma plataforma de e-commerce com sistema de pagamento integrado, painel administrativo e aplicativo mobile.',
      budget: 5000,
      type: 'fixed',
      category: 'desenvolvimento-web',
      status: 'open',
      skills: ['React', 'Node.js', 'E-commerce', 'Stripe', 'MongoDB'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      scope: 'Projeto completo incluindo frontend, backend e integração com APIs de pagamento',
      level: 'intermediate',
      company: {
        id: 'comp1',
        name: 'Tech Solutions Ltda',
        companyName: 'Tech Solutions',
        rating: 4.5,
        reviewsCount: 12,
        image: null
      },
      proposals: [
        {
          id: 'prop1',
          freelancerId: 'freelancer1',
          budget: 4500,
          status: 'pending',
          freelancer: {
            id: 'freelancer1',
            name: 'João Silva',
            rating: 4.8,
            image: null
          }
        }
      ],
      proposalsCount: 1,
      location: 'São Paulo, SP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('API: Projeto obtido com sucesso (mock)');
    
    return NextResponse.json(mockProject);

  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API /projects/[id] PUT: Atualizando projeto');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const { id } = await params;
      const data = await request.json();
      
      console.log('API: Token verificado para atualizar projeto:', decodedToken.uid);
      console.log('API: Dados recebidos para atualização:', data);
      
      // Por enquanto, apenas simular a atualização
      // TODO: Implementar com Firestore futuramente
      const updatedProject = {
        id,
        ...data,
        updatedAt: new Date().toISOString()
      };

      console.log('API: Projeto atualizado com sucesso (mock)');
      
      return NextResponse.json({
        success: true,
        project: updatedProject,
        message: 'Projeto atualizado com sucesso'
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API /projects/[id] DELETE: Deletando projeto');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const { id } = await params;
      
      console.log('API: Token verificado para deletar projeto:', decodedToken.uid);
      console.log('API: ID do projeto a ser deletado:', id);
      
      // Por enquanto, apenas simular a exclusão
      // TODO: Implementar com Firestore futuramente
      console.log('API: Projeto deletado com sucesso (mock)');
      
      return NextResponse.json({
        success: true,
        message: 'Projeto deletado com sucesso'
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 