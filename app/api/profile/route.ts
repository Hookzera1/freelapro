import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

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
      
      // Buscar dados do usuário no Prisma
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.uid }
      });

      if (!user) {
        console.log('API: Usuário não encontrado no Prisma');
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      console.log('API: Dados do perfil obtidos com sucesso');
      
      return NextResponse.json(user);
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
      
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
      });

      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      // Atualizar apenas campos que existem no schema
      const updatedUser = await prisma.user.update({
        where: { id: decodedToken.uid },
        data: {
          name: data.name || user.name,
          userType: data.userType || user.userType,
          updatedAt: new Date()
        }
      });

      console.log('API: Perfil atualizado com sucesso');
      return NextResponse.json(updatedUser);
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