import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

// GET - Listar contratos do usuário
export async function GET(request: NextRequest) {
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

    const userId = decodedToken.uid;

    // Buscar contratos onde o usuário é freelancer ou empresa
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { freelancerId: userId },
          { companyId: userId }
        ]
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            technologies: true
          }
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            image: true
          }
        },
        milestones: {
          orderBy: {
            dueDate: 'asc'
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular progresso de cada contrato
    const contractsWithProgress = contracts.map(contract => {
      const totalMilestones = contract.milestones.length;
      const completedMilestones = contract.milestones.filter(m => 
        ['COMPLETED', 'APPROVED', 'PAID'].includes(m.status)
      ).length;
      
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      return {
        ...contract,
        progress,
        client: userId === contract.freelancerId ? contract.company : contract.freelancer
      };
    });

    return NextResponse.json(contractsWithProgress);

  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar contrato (chamado quando proposta é aceita)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { projectId, freelancerId, companyId, totalAmount, deadline, milestones } = body;

    console.log('=== CRIANDO CONTRATO ===');
    console.log('Projeto ID:', projectId);
    console.log('Marcos personalizados:', milestones ? 'Sim' : 'Não');

    // Validar dados obrigatórios
    if (!projectId || !freelancerId || !companyId || !totalAmount || !deadline) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando: projectId, freelancerId, companyId, totalAmount, deadline' },
        { status: 400 }
      );
    }

    // Verificar se já existe contrato para este projeto
    const existingContract = await prisma.contract.findUnique({
      where: { projectId }
    });

    if (existingContract) {
      return NextResponse.json(
        { error: 'Já existe um contrato para este projeto' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão (deve ser a empresa do projeto)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true, status: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    if (project.companyId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Validar marcos se fornecidos
    if (milestones && milestones.length > 0) {
      const totalMilestonesAmount = milestones.reduce((sum: number, m: any) => sum + (m.amount || 0), 0);
      if (Math.abs(totalMilestonesAmount - totalAmount) > 1) {
        return NextResponse.json(
          { error: `Soma dos marcos (${totalMilestonesAmount}) deve ser igual ao valor total (${totalAmount})` },
          { status: 400 }
        );
      }
    }

    // Criar contrato
    const contract = await prisma.contract.create({
      data: {
        projectId,
        freelancerId,
        companyId,
        totalAmount,
        deadline: new Date(deadline)
      }
    });

    console.log('Contrato criado:', contract.id);

    // Criar marcos se fornecidos
    if (milestones && milestones.length > 0) {
      console.log('Criando marcos personalizados...');
      await prisma.milestone.createMany({
        data: milestones.map((milestone: any) => ({
          contractId: contract.id,
          title: milestone.title,
          description: milestone.description || '',
          amount: milestone.amount,
          dueDate: new Date(milestone.dueDate),
          deliverables: JSON.stringify(milestone.deliverables || [])
        }))
      });
      console.log('Marcos criados:', milestones.length);
    } else {
      console.log('Criando marcos padrão...');
      // Criar marcos padrão se não foram fornecidos
      const projectDuration = Math.max(
        Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        14 // Mínimo 14 dias
      );
      
      const defaultMilestones = [
        {
          title: "Início e Planejamento",
          description: "Setup inicial, análise de requisitos e planejamento detalhado",
          amount: Math.round(totalAmount * 0.25),
          dueDate: new Date(Date.now() + Math.min(7, Math.floor(projectDuration * 0.2)) * 24 * 60 * 60 * 1000),
          deliverables: JSON.stringify([
            "Documento de requisitos",
            "Cronograma detalhado",
            "Setup do ambiente de desenvolvimento"
          ])
        },
        {
          title: "Desenvolvimento Principal",
          description: "Implementação das funcionalidades principais do projeto",
          amount: Math.round(totalAmount * 0.50),
          dueDate: new Date(Date.now() + Math.floor(projectDuration * 0.7) * 24 * 60 * 60 * 1000),
          deliverables: JSON.stringify([
            "Funcionalidades principais implementadas",
            "Testes básicos realizados",
            "Demonstração funcional"
          ])
        },
        {
          title: "Finalização e Entrega",
          description: "Ajustes finais, testes completos e entrega do projeto",
          amount: totalAmount - Math.round(totalAmount * 0.25) - Math.round(totalAmount * 0.50),
          dueDate: new Date(deadline),
          deliverables: JSON.stringify([
            "Projeto finalizado e testado",
            "Documentação técnica",
            "Deploy e entrega final"
          ])
        }
      ];

      await prisma.milestone.createMany({
        data: defaultMilestones.map(milestone => ({
          contractId: contract.id,
          ...milestone
        }))
      });
      console.log('Marcos padrão criados: 3');
    }

    // Buscar contrato completo
    const fullContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            technologies: true
          }
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            companyName: true,
            image: true
          }
        },
        milestones: {
          orderBy: {
            dueDate: 'asc'
          }
        }
      }
    });

    return NextResponse.json(fullContract, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 