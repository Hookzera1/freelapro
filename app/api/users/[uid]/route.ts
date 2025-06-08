import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    console.log('API /users/[uid]: Iniciando requisição GET:', uid);

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

    // Buscar dados do usuário no PostgreSQL
    console.log('API /users/[uid]: Buscando dados no PostgreSQL:', uid);
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        companyName: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('API /users/[uid]: Usuário não encontrado:', uid);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Validar tipo de usuário
    const userType = user.userType && ['company', 'freelancer'].includes(user.userType) 
      ? user.userType 
      : 'freelancer';

    const responseData = {
      uid: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      userType,
      companyName: user.companyName,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('API /users/[uid]: Dados retornados com sucesso');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API /users/[uid]: Erro ao buscar usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
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
    const { name, companyName, userType, image } = data;

    // Validar tipo de usuário
    const validUserType = userType && ['company', 'freelancer'].includes(userType) 
      ? userType 
      : undefined;

    // Atualizar no PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: uid },
      data: {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(validUserType && { userType: validUserType }),
        ...(image && { image }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('API: Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
} 