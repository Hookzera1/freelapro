import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await verifyAuthToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { uid } = await params;

    // Verificar se o usuário está acessando suas próprias notificações
    if (decodedToken.uid !== uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Buscar notificações do usuário
    const notifications = await prisma.notification.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limitar a 50 notificações mais recentes
    });

    const formattedNotifications = notifications.map(notif => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
      relatedId: notif.relatedId,
      relatedType: notif.relatedType
    }));

    return NextResponse.json(formattedNotifications);

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await verifyAuthToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { uid } = await params;
    const { action, notificationId } = await request.json();

    // Verificar se o usuário está acessando suas próprias notificações
    if (decodedToken.uid !== uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    if (action === 'mark_read' && notificationId) {
      // Marcar uma notificação específica como lida
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: uid
        }
      });

      if (!notification) {
        return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });

      return NextResponse.json({ message: 'Notificação marcada como lida' });

    } else if (action === 'mark_all_read') {
      // Marcar todas as notificações como lidas
      await prisma.notification.updateMany({
        where: {
          userId: uid,
          read: false
        },
        data: { read: true }
      });

      return NextResponse.json({ message: 'Todas as notificações foram marcadas como lidas' });

    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await verifyAuthToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { uid } = await params;
    const { notificationId } = await request.json();

    // Verificar se o usuário está acessando suas próprias notificações
    if (decodedToken.uid !== uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'ID da notificação é obrigatório' }, { status: 400 });
    }

    // Verificar se a notificação pertence ao usuário
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: uid
      }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    // Deletar a notificação
    await prisma.notification.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({ message: 'Notificação deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 