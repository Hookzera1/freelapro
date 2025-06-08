import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('API /users/me GET: Iniciando busca de usuário atual');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para user/me:', decodedToken.uid);
      
      // Buscar dados do usuário no Firestore
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.log('API: Usuário não encontrado no Firestore, criando...');
        
        // Criar usuário no Firestore se não existir
        const firebaseUser = await auth.getUser(decodedToken.uid);
        const newUserData = {
          id: decodedToken.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Usuário',
          userType: 'freelancer',
          profilePicture: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await userRef.set(newUserData);
        console.log('API: Novo usuário criado no Firestore');
        
        return NextResponse.json(newUserData);
      }

      const userData = userDoc.data();
      console.log('API: Dados do usuário obtidos com sucesso');
      
      return NextResponse.json({
        id: decodedToken.uid,
        ...userData
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 