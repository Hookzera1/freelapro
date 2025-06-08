import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { NextRequest } from 'next/server';
import { DocumentData } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('API /users POST: Iniciando criação de usuário');
    
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('API: Token não fornecido ou formato inválido');
      return NextResponse.json(
        { error: 'Token não fornecido ou formato inválido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      // Verificar token com Firebase Admin
      decodedToken = await getAuth().verifyIdToken(token);
      console.log('API: Token verificado:', {
        uid: decodedToken.uid,
        email: decodedToken.email
      });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { uid, name, email, userType, companyName } = data;

    console.log('API: Dados recebidos:', { uid, name, email, userType, companyName });

    // Validar dados obrigatórios
    if (!uid || !name || !email || !userType) {
      console.log('API: Dados obrigatórios ausentes:', { uid, name, email, userType });
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Validar tipo de usuário
    if (!['company', 'freelancer'].includes(userType)) {
      console.log('API: Tipo de usuário inválido:', userType);
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe no Firestore
    console.log('API: Verificando se usuário já existe no Firestore');
    const userRef = db.collection('users').doc(uid);
    const existingDoc = await userRef.get();

    if (existingDoc.exists) {
      console.log('API: Usuário já existe no Firestore:', uid);
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 409 }
      );
    }

    // Criar usuário no Firestore
    const userData = {
      name,
      email,
      userType,
      companyName: userType === 'company' ? companyName : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('API: Criando usuário no Firestore:', {
      uid,
      ...userData
    });

    await userRef.set(userData);

    // Atualizar claims do usuário no Firebase Auth
    try {
      await getAuth().setCustomUserClaims(uid, {
        userType: userType
      });
      console.log('API: Claims do usuário definidos com sucesso');
    } catch (error) {
      console.error('API: Erro ao definir claims:', error);
      // Não falhar por causa disso
    }

    console.log('API: Usuário criado com sucesso no Firestore');
    return NextResponse.json({
      success: true,
      uid,
      ...userData
    });
  } catch (error) {
    console.error('API: Erro ao criar usuário:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('API: Detalhes do erro:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('API /users GET: Iniciando busca de usuários');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar todos os usuários usando Admin SDK
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('API: Usuários encontrados:', users.length);
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const data = await request.json();
    const { name, companyName, bio, skills, location, website, github, linkedin } = data;

    // Atualizar usuário no Firestore usando Admin SDK
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as DocumentData;
    await userRef.set({
      ...userData,
      name: name || userData.name,
      companyName: userData.userType === 'company' ? (companyName || userData.companyName) : null,
      bio: bio || userData.bio,
      skills: skills || userData.skills,
      location: location || userData.location,
      website: website || userData.website,
      github: github || userData.github,
      linkedin: linkedin || userData.linkedin,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
} 