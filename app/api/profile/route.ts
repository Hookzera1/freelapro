import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('API /profile GET: Iniciando busca de perfil');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para perfil:', decodedToken.uid);
      
      // Buscar dados do usuário no Firestore
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.log('API: Usuário não encontrado no Firestore');
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      const userData = userDoc.data();
      console.log('API: Dados do perfil obtidos com sucesso');
      
      return NextResponse.json({
        uid: decodedToken.uid,
        ...userData
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('API /profile PUT: Atualizando perfil');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const data = await request.json();
      
      console.log('API: Dados recebidos para atualização:', data);
      
      // Atualizar dados do usuário no Firestore
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      const currentData = userDoc.data();
      const updatedData = {
        ...currentData,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await userRef.set(updatedData);
      
      console.log('API: Perfil atualizado com sucesso');
      return NextResponse.json({ success: true, data: updatedData });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}