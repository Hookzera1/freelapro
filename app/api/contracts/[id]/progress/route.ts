import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

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

    // Buscar contrato e verificar permissões
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' }
        },
        project: {
          select: {
            title: true,
            status: true
          }
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true
          }
        }
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

    // Calcular estatísticas de progresso
    const totalMilestones = contract.milestones.length;
    const completedMilestones = contract.milestones.filter(m => 
      ['COMPLETED', 'APPROVED', 'PAID'].includes(m.status)
    ).length;
    const approvedMilestones = contract.milestones.filter(m => 
      ['APPROVED', 'PAID'].includes(m.status)
    ).length;
    const paidMilestones = contract.milestones.filter(m => 
      m.status === 'PAID'
    ).length;

    const overallProgress = totalMilestones > 0 ? 
      Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const paymentProgress = totalMilestones > 0 ? 
      Math.round((paidMilestones / totalMilestones) * 100) : 0;

    // Calcular valores financeiros
    const totalValue = contract.totalAmount;
    const completedValue = contract.milestones
      .filter(m => ['COMPLETED', 'APPROVED', 'PAID'].includes(m.status))
      .reduce((sum, m) => sum + m.amount, 0);
    const paidValue = contract.milestones
      .filter(m => m.status === 'PAID')
      .reduce((sum, m) => sum + m.amount, 0);
    const pendingValue = totalValue - paidValue;

    // Analisar timeline e prazos
    const now = new Date();
    const overdueMilestones = contract.milestones.filter(m => 
      new Date(m.dueDate) < now && !['APPROVED', 'PAID'].includes(m.status)
    );
    const upcomingMilestones = contract.milestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && daysDiff > 0 && !['APPROVED', 'PAID'].includes(m.status);
    });

    // Status resumido por marco
    const milestonesSummary = contract.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
      amount: milestone.amount,
      dueDate: milestone.dueDate,
      isOverdue: new Date(milestone.dueDate) < now && !['APPROVED', 'PAID'].includes(milestone.status),
      isUpcoming: (() => {
        const dueDate = new Date(milestone.dueDate);
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7 && daysDiff > 0 && !['APPROVED', 'PAID'].includes(milestone.status);
      })(),
      completedAt: milestone.completedAt,
      approvedAt: milestone.approvedAt,
      paidAt: milestone.paidAt
    }));

    // Timeline do contrato
    const contractDuration = Math.ceil(
      (new Date(contract.deadline).getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.ceil(
      (now.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.ceil(
      (new Date(contract.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeProgress = Math.max(0, Math.min(100, 
      Math.round((daysElapsed / contractDuration) * 100)
    ));

    return NextResponse.json({
      contract: {
        id: contract.id,
        status: contract.status,
        totalAmount: contract.totalAmount,
        startDate: contract.startDate,
        deadline: contract.deadline,
        project: contract.project,
        freelancer: contract.freelancer,
        company: contract.company
      },
      progress: {
        overall: overallProgress,
        payment: paymentProgress,
        time: timeProgress
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        approved: approvedMilestones,
        paid: paidMilestones,
        overdue: overdueMilestones.length,
        upcoming: upcomingMilestones.length,
        summary: milestonesSummary
      },
      financial: {
        totalValue,
        completedValue,
        paidValue,
        pendingValue,
        paymentProgress: Math.round((paidValue / totalValue) * 100)
      },
      timeline: {
        contractDuration,
        daysElapsed: Math.max(0, daysElapsed),
        daysRemaining: Math.max(0, daysRemaining),
        isOverdue: daysRemaining < 0,
        progressVsTime: overallProgress - timeProgress // Positivo = adiantado, Negativo = atrasado
      },
      alerts: {
        overdueMilestones: overdueMilestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          daysOverdue: Math.ceil((now.getTime() - new Date(m.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        })),
        upcomingMilestones: upcomingMilestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          daysUntilDue: Math.ceil((new Date(m.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar progresso do contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 