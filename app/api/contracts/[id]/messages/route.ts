import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// Map para armazenar conexões SSE ativas
const sseConnections = new Map<string, (data: any) => void>();

// Função interna para gerenciar conexões SSE
function removeSSEConnection(contractId: string, userId: string) {
  const key = `${contractId}-${userId}`;
  sseConnections.delete(key);
}

function broadcastMessage(contractId: string, message: any, excludeUserId?: string) {
  Array.from(sseConnections.entries())
    .filter(([key]) => {
      const [connContractId, connUserId] = key.split('-');
      return connContractId === contractId && connUserId !== excludeUserId;
    })
    .forEach(([key, sendFunction]) => {
      try {
        sendFunction(message);
      } catch (error) {
        console.error('Erro ao enviar mensagem via SSE:', error);
        sseConnections.delete(key);
      }
    });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: contractId } = await params;

    // Verificar se o usuário tem acesso ao contrato
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        freelancer: true,
        company: true
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    const userId = decodedToken.uid;
    const hasAccess = contract.freelancerId === userId || contract.companyId === userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Buscar mensagens do contrato
    const messages = await prisma.message.findMany({
      where: { contractId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name || message.sender.email,
      senderImage: message.sender.image,
      createdAt: message.createdAt.toISOString(),
      isOwnMessage: message.senderId === userId
    }));

    return NextResponse.json(formattedMessages);

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: contractId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Conteúdo da mensagem é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário tem acesso ao contrato
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        freelancer: true,
        company: true,
        project: true
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    const userId = decodedToken.uid;
    const hasAccess = contract.freelancerId === userId || contract.companyId === userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Criar a mensagem
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        contractId,
        createdAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Determinar o destinatário da notificação
    const recipientId = contract.freelancerId === userId ? contract.companyId : contract.freelancerId;
    const senderName = message.sender.name || message.sender.email;

    // Criar notificação para o destinatário
    if (recipientId) {
      await createNotification({
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'Nova Mensagem',
        message: `${senderName} enviou uma mensagem no projeto "${contract.project.title}"`,
        relatedId: contractId,
        relatedType: 'contract'
      });
    }

    // Formato da resposta
    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name || message.sender.email,
      senderImage: message.sender.image,
      createdAt: message.createdAt.toISOString(),
      isOwnMessage: true
    };

    // Broadcast da mensagem para conexões ativas
    broadcastMessage(contractId, formattedMessage, userId);

    return NextResponse.json(formattedMessage);

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 