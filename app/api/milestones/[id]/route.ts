import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { MilestoneStatus } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== Iniciando atualização de marco ===');
    
    // Teste de conexão com o banco
    try {
      console.log('Testando conexão com o banco...');
      await prisma.$queryRaw`SELECT 1`;
      console.log('Conexão com banco OK');
    } catch (dbError) {
      console.error('Erro de conexão com banco:', dbError);
      return NextResponse.json({ error: 'Erro de conexão com banco de dados' }, { status: 500 });
    }
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('Erro: Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token recebido, verificando autenticação...');
    
    const decodedToken = await verifyAuthToken(token);
    
    if (!decodedToken) {
      console.log('Erro: Token inválido');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log('Usuário autenticado:', decodedToken.uid);

    let body;
    try {
      body = await request.json();
      console.log('Body da requisição:', body);
    } catch (jsonError) {
      console.error('Erro ao fazer parse do JSON:', jsonError);
      return NextResponse.json({ error: 'Dados inválidos na requisição' }, { status: 400 });
    }
    
    const { action, note } = body;
    
    if (!action) {
      console.log('Erro: Ação não fornecida');
      return NextResponse.json({ error: 'Ação é obrigatória' }, { status: 400 });
    }
    
    const { id: milestoneId } = await params;
    
    if (!milestoneId) {
      console.log('Erro: ID do marco não fornecido');
      return NextResponse.json({ error: 'ID do marco é obrigatório' }, { status: 400 });
    }
    
    console.log(`Processando ação "${action}" para marco: ${milestoneId}`);

    // Buscar o marco e o contrato relacionado
    console.log('Buscando dados do marco...');
    let milestone;
    try {
      milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          contract: {
            include: {
              freelancer: true,
              company: true,
              project: true
            }
          }
        }
      });
    } catch (dbError) {
      console.error('Erro ao buscar marco:', dbError);
      return NextResponse.json({ error: 'Erro ao buscar dados do marco' }, { status: 500 });
    }

    if (!milestone) {
      console.log('Erro: Marco não encontrado');
      return NextResponse.json({ error: 'Marco não encontrado' }, { status: 404 });
    }

    console.log('Marco encontrado:', {
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
      contractId: milestone.contractId
    });

    // Verificar permissões
    const userId = decodedToken.uid;
    const isFreelancer = milestone.contract.freelancerId === userId;
    const isCompany = milestone.contract.companyId === userId;

    console.log('Verificação de permissões:', {
      userId,
      isFreelancer,
      isCompany,
      freelancerId: milestone.contract.freelancerId,
      companyId: milestone.contract.companyId
    });

    if (!isFreelancer && !isCompany) {
      console.log('Erro: Usuário não autorizado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    let newStatus: MilestoneStatus = milestone.status;
    let updateData: any = {};
    let notificationType: string | null = null;
    let notificationMessage = '';
    let notificationRecipientId = '';

    // Validar transições de status
    const validTransitions: Record<MilestoneStatus, MilestoneStatus[]> = {
      'PENDING': ['IN_PROGRESS'],
      'IN_PROGRESS': ['COMPLETED'],
      'COMPLETED': ['APPROVED', 'IN_PROGRESS'], // IN_PROGRESS para revisão
      'APPROVED': ['PAID'],
      'PAID': [] // Status final
    };

    console.log(`Processando ação: ${action}`);

    switch (action) {
      case 'start':
        if (!isFreelancer) {
          return NextResponse.json({ error: 'Apenas o freelancer pode iniciar marcos' }, { status: 403 });
        }
        if (!validTransitions[milestone.status]?.includes('IN_PROGRESS')) {
          return NextResponse.json({ error: 'Marco deve estar pendente para ser iniciado' }, { status: 400 });
        }
        newStatus = 'IN_PROGRESS';
        notificationType = 'MILESTONE_STARTED';
        notificationMessage = `O freelancer iniciou o marco "${milestone.title}"`;
        notificationRecipientId = milestone.contract.companyId;
        break;

      case 'complete':
        if (!isFreelancer) {
          return NextResponse.json({ error: 'Apenas o freelancer pode marcar marcos como concluídos' }, { status: 403 });
        }
        if (!validTransitions[milestone.status]?.includes('COMPLETED')) {
          return NextResponse.json({ error: 'Marco deve estar em progresso para ser concluído' }, { status: 400 });
        }
        newStatus = 'COMPLETED';
        updateData.completedAt = new Date();
        notificationType = 'MILESTONE_COMPLETED';
        notificationMessage = `O marco "${milestone.title}" foi concluído e está aguardando aprovação`;
        notificationRecipientId = milestone.contract.companyId;
        break;

      case 'approve':
        if (!isCompany) {
          return NextResponse.json({ error: 'Apenas a empresa pode aprovar marcos' }, { status: 403 });
        }
        if (!validTransitions[milestone.status]?.includes('APPROVED')) {
          return NextResponse.json({ error: 'Marco deve estar concluído para ser aprovado' }, { status: 400 });
        }
        newStatus = 'APPROVED';
        updateData.approvedAt = new Date();
        notificationType = 'MILESTONE_APPROVED';
        notificationMessage = `O marco "${milestone.title}" foi aprovado - R$ ${milestone.amount.toFixed(2).replace('.', ',')} liberado para pagamento`;
        notificationRecipientId = milestone.contract.freelancerId;
        break;

      case 'request_revision':
        if (!isCompany) {
          return NextResponse.json({ error: 'Apenas a empresa pode solicitar revisões' }, { status: 403 });
        }
        if (!validTransitions[milestone.status]?.includes('IN_PROGRESS')) {
          return NextResponse.json({ error: 'Marco deve estar concluído para solicitar revisão' }, { status: 400 });
        }
        // Volta para IN_PROGRESS quando revisão é solicitada
        newStatus = 'IN_PROGRESS';
        notificationType = 'MILESTONE_REVISION_REQUESTED';
        notificationMessage = note ? 
          `Revisão solicitada para o marco "${milestone.title}": ${note}` :
          `Revisão solicitada para o marco "${milestone.title}"`;
        notificationRecipientId = milestone.contract.freelancerId;
        break;

      case 'pay':
        if (!isCompany) {
          return NextResponse.json({ error: 'Apenas a empresa pode marcar marcos como pagos' }, { status: 403 });
        }
        if (!validTransitions[milestone.status]?.includes('PAID')) {
          return NextResponse.json({ error: 'Marco deve estar aprovado para ser pago' }, { status: 400 });
        }
        newStatus = 'PAID';
        updateData.paidAt = new Date();
        notificationType = 'PAYMENT_RECEIVED';
        notificationMessage = `Pagamento de R$ ${milestone.amount.toFixed(2).replace('.', ',')} do marco "${milestone.title}" foi processado`;
        notificationRecipientId = milestone.contract.freelancerId;
        break;

      default:
        console.log('Erro: Ação inválida:', action);
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    console.log('Dados da atualização:', {
      currentStatus: milestone.status,
      newStatus,
      updateData,
      notificationType,
      notificationRecipientId
    });

    console.log('Iniciando atualização simples do marco...');
    
    let result;
    try {
      // Primeiro, vamos tentar apenas atualizar o marco sem transação
      console.log('1. Atualizando apenas o marco...');
      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: newStatus,
          ...updateData
        }
      });
      console.log('Marco atualizado com sucesso');

      console.log('2. Calculando progresso do contrato...');
      // 2. Calcular progresso do contrato
      const allMilestones = await prisma.milestone.findMany({
        where: { contractId: milestone.contract.id }
      });

      const completedCount = allMilestones.filter(m => 
        ['COMPLETED', 'APPROVED', 'PAID'].includes(m.status)
      ).length;
      
      const progress = allMilestones.length > 0 ? 
        Math.round((completedCount / allMilestones.length) * 100) : 0;

      console.log(`Progresso calculado: ${completedCount}/${allMilestones.length} = ${progress}%`);

      console.log('3. Verificando se contrato deve ser marcado como concluído...');
      // 3. Verificar se contrato deve ser marcado como concluído
      const allPaid = allMilestones.every(m => m.status === 'PAID');

      if (allPaid && milestone.contract.status !== 'COMPLETED') {
        console.log('Atualizando status do contrato para COMPLETED...');
        try {
          await prisma.contract.update({
            where: { id: milestone.contract.id },
            data: { status: 'COMPLETED' }
          });
          console.log('Contrato atualizado para COMPLETED');
        } catch (contractError) {
          console.error('Erro ao atualizar contrato:', contractError);
          // Não vamos falhar por isso
        }
      } else {
        console.log('Nenhuma atualização necessária no contrato');
      }

      result = {
        milestone: updatedMilestone,
        progress,
        contractCompleted: allPaid
      };

      console.log('Atualização do marco concluída com sucesso');
      
    } catch (updateError) {
      console.error('Erro durante atualização do marco:', updateError);
      throw updateError; // Re-throw para ser capturado pelo catch principal
    }

    console.log('5. Criando notificação...');
    // 5. Criar notificação fora da transação para evitar conflitos
    if (notificationType && notificationRecipientId) {
      try {
        await createNotification({
          userId: notificationRecipientId,
          type: notificationType as any,
          title: 'Atualização de Marco',
          message: notificationMessage,
          relatedId: milestone.contract.id,
          relatedType: 'contract'
        });
        console.log('Notificação criada com sucesso');
      } catch (notificationError) {
        console.error('Erro ao criar notificação (não crítico):', notificationError);
        // Não vamos falhar a requisição por causa de erro na notificação
      }
    } else {
      console.log('Nenhuma notificação necessária');
    }

    console.log('=== Atualização de marco concluída com sucesso ===');
    return NextResponse.json({
      milestone: result.milestone,
      progress: result.progress,
      contractCompleted: result.contractCompleted,
      message: 'Marco atualizado com sucesso'
    });

  } catch (error: any) {
    console.error('=== ERRO DETALHADO ===');
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', error?.name);
    console.error('Mensagem do erro:', error?.message);
    console.error('Stack trace:', error?.stack);
    console.error('Erro completo:', error);
    console.error('========================');
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Novo endpoint para buscar logs de auditoria de um marco
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

    const { id: milestoneId } = await params;

    // Buscar marco e verificar permissões
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: true
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Marco não encontrado' }, { status: 404 });
    }

    const userId = decodedToken.uid;
    const hasAccess = milestone.contract.freelancerId === userId || 
                     milestone.contract.companyId === userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Buscar logs de auditoria (temporariamente removido até migração do Prisma)
    // const logs = await prisma.milestoneLog.findMany({
    //   where: { milestoneId },
    //   include: {
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true
    //       }
    //     }
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    return NextResponse.json({ logs: [] });

  } catch (error) {
    console.error('Erro ao buscar logs do marco:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 