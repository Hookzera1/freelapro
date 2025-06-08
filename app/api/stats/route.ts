import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('API /stats GET: Iniciando busca de estatísticas');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para estatísticas:', decodedToken.uid);
      
      // Por enquanto, retornar dados mock para evitar erros
      // TODO: Implementar com Firestore futuramente
      const mockStats = {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalEarnings: 0,
        totalProposals: 0,
        acceptedProposals: 0,
        pendingProposals: 0,
        rejectedProposals: 0,
        averageRating: 0,
        totalReviews: 0,
        profileViews: 0,
        lastMonthEarnings: 0,
        monthlyGrowth: 0
      };

      console.log('API: Estatísticas obtidas com sucesso (mock)');
      
      return NextResponse.json(mockStats);
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 