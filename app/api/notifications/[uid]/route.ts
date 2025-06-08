import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    console.log('API /notifications/[uid] GET: Iniciando busca de notificações');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log('API: Token verificado para notificações:', decodedToken.uid);
      
      const { uid } = await params;

      // Verificar se o usuário está acessando suas próprias notificações
      if (decodedToken.uid !== uid) {
        console.log('API: Tentativa de acesso não autorizado às notificações');
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      // Buscar notificações do usuário no Prisma
      const notifications = await prisma.notification.findMany({
        where: {
          userId: uid
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limitar a 50 notificações mais recentes
      });

      console.log('API: Notificações encontradas:', notifications.length);
      return NextResponse.json(notifications);
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    console.log('API /notifications/[uid] PATCH: Atualizando notificações');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const { uid } = await params;
      const { action, notificationId } = await request.json();

      // Verificar se o usuário está acessando suas próprias notificações
      if (decodedToken.uid !== uid) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      if (action === 'mark_read') {
        await prisma.notification.update({
          where: {
            id: notificationId,
            userId: uid
          },
          data: {
            read: true
          }
        });
        return NextResponse.json({ message: 'Notificação marcada como lida' });
      } else if (action === 'mark_all_read') {
        await prisma.notification.updateMany({
          where: {
            userId: uid,
            read: false
          },
          data: {
            read: true
          }
        });
        return NextResponse.json({ message: 'Todas as notificações foram marcadas como lidas' });
      } else {
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
      }
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    console.log('API /notifications/[uid] DELETE: Deletando notificação');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const { uid } = await params;
      const { notificationId } = await request.json();

      // Verificar se o usuário está acessando suas próprias notificações
      if (decodedToken.uid !== uid) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      if (!notificationId) {
        return NextResponse.json({ error: 'ID da notificação é obrigatório' }, { status: 400 });
      }

      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: uid
        }
      });
      
      return NextResponse.json({ message: 'Notificação deletada com sucesso' });
    } catch (error) {
      console.error('API: Erro ao verificar token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 