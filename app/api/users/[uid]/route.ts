import { NextRequest, NextResponse } from 'next/server';
import { db, auth, checkFirebaseConnection } from '@/lib/firebase-admin';
import { DocumentData } from 'firebase-admin/firestore';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    console.log('API /users/[uid]: Iniciando requisição GET:', {
      uid,
      headers: Object.fromEntries(request.headers)
    });

    // Verificar conexão com Firebase
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.error('API /users/[uid]: Erro de conexão com Firebase');
      return NextResponse.json(
        { error: 'Erro de conexão com o servidor' },
        { status: 503 }
      );
    }

    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('API /users/[uid]: Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token com Firebase Admin
    try {
      console.log('API /users/[uid]: Verificando token...');
      const decodedToken = await auth.verifyIdToken(token);
      
      // Verificar se o usuário está tentando acessar seus próprios dados
      if (decodedToken.uid !== uid) {
        console.log('API /users/[uid]: Tentativa de acesso não autorizado', {
          tokenUid: decodedToken.uid,
          requestedUid: uid
        });
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 403 }
        );
      }
      
      console.log('API /users/[uid]: Token válido para:', decodedToken.uid);
    } catch (error) {
      console.error('API /users/[uid]: Erro na verificação do token:', error);
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar dados do usuário no Firestore
    console.log('API /users/[uid]: Buscando dados no Firestore:', uid);
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('API /users/[uid]: Usuário não encontrado:', uid);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const userData: DocumentData | undefined = userDoc.data();
    
    // Validar tipo de usuário
    const userType = userData && ['company', 'freelancer'].includes(userData.userType) 
      ? userData.userType 
      : 'freelancer';

    const responseData = {
      ...userData,
      userType,
      uid
    };

    console.log('API /users/[uid]: Dados retornados com sucesso');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API /users/[uid]: Erro ao buscar usuário:', error);
    // Tentar obter mais informações sobre o erro
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : error;
    
    console.error('API /users/[uid]: Detalhes do erro:', errorDetails);
    
    return NextResponse.json(
      { error: 'Erro ao buscar usuário', details: errorDetails },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;

    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido ou formato inválido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Verificar token com Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);
      
      // Verificar se o usuário está tentando atualizar seus próprios dados
      if (decodedToken.uid !== uid) {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, companyName, bio, skills, location, website, github, linkedin, userType, image } = data;

    // Atualizar no Prisma
    await prisma.user.update({
      where: { id: uid },
      data: {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(bio && { bio }),
        ...(skills && { skills }),
        ...(location && { location }),
        ...(website && { website }),
        ...(github && { github }),
        ...(linkedin && { linkedin }),
        ...(userType && { userType }),
        ...(image && { image }),
        updatedAt: new Date()
      }
    });

    // Também atualizar no Firestore se necessário
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const validUserType = userType === 'company' ? 'company' : 'freelancer';

    if (userDoc.exists) {
      const userData = userDoc.data();

      await userRef.update({
        ...(name && { name }),
        ...(companyName && validUserType === 'company' && { companyName }),
        ...(bio && { bio }),
        ...(skills && { skills }),
        ...(location && { location }),
        ...(website && { website }),
        ...(github && { github }),
        ...(linkedin && { linkedin }),
        ...(userType && { userType: validUserType }),
        ...(image && { image }),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true,
      userType: validUserType
    });
  } catch (error) {
    console.error('API: Erro ao atualizar usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 