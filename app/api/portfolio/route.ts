import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

// GET - Buscar itens do portfolio
export async function GET(request: NextRequest) {
  try {
    console.log('API /portfolio GET: Iniciando busca de portfólio');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para portfólio:', decodedToken.uid);
      
      // Buscar portfólio do usuário no Firestore
      const portfolioRef = db.collection('portfolios').where('userId', '==', decodedToken.uid);
      const portfolioSnapshot = await portfolioRef.get();

      const portfolioItems = portfolioSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('API: Portfólio obtido com sucesso:', portfolioItems.length, 'itens');
      
      return NextResponse.json(portfolioItems);
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar portfólio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo item do portfolio
export async function POST(request: NextRequest) {
  try {
    console.log('API /portfolio POST: Criando item de portfólio');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const data = await request.json();
      
      console.log('API: Dados recebidos para novo item de portfólio:', data);
      
      // Criar novo item de portfólio no Firestore
      const portfolioData = {
        ...data,
        userId: decodedToken.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const portfolioRef = await db.collection('portfolios').add(portfolioData);
      
      const newItem = {
        id: portfolioRef.id,
        ...portfolioData
      };

      console.log('API: Item de portfólio criado com sucesso:', portfolioRef.id);
      return NextResponse.json(newItem);
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao criar item de portfólio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 