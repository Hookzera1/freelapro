import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../../../../auth/middleware';

interface Params {
  id: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = await params;
    
    // Receber marcos personalizados do frontend
    const body = await request.json();
    const { milestones: customMilestones } = body;

    console.log('=== INÍCIO ACEITAR PROPOSTA ===');
    console.log('ID da Proposta:', id);
    console.log('ID da Empresa:', user.id);
    console.log('Marcos personalizados:', customMilestones ? 'Sim' : 'Não');

    // Verificar se a proposta existe e pertence à empresa
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            companyId: true,
            title: true,
            status: true,
            deadline: true,
            budget: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('Proposta encontrada:', proposal ? {
      id: proposal.id,
      status: proposal.status,
      projectId: proposal.project.id,
      projectStatus: proposal.project.status,
      projectTitle: proposal.project.title
    } : 'Não encontrada');

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    if (proposal.project.companyId !== user.id) {
      return NextResponse.json(
        { error: 'Não autorizado - Esta proposta não pertence à sua empresa' },
        { status: 403 }
      );
    }

    if (proposal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta proposta já foi processada' },
        { status: 400 }
      );
    }

    if (proposal.project.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Este projeto não está mais aberto para propostas' },
        { status: 400 }
      );
    }

    console.log('=== INICIANDO TRANSAÇÃO ===');
    // Executar transação para atualizar proposta, projeto e criar contrato
    const result = await prisma.$transaction(async (tx) => {
      console.log('1. Atualizando proposta para ACCEPTED...');
      // 1. Atualizar status da proposta para ACCEPTED
      const updatedProposal = await tx.proposal.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });
      console.log('Proposta atualizada:', updatedProposal.id, 'Status:', updatedProposal.status);

      console.log('2. Atualizando projeto para IN_PROGRESS...');
      // 2. Atualizar projeto: status para IN_PROGRESS e definir freelancer
      const updatedProject = await tx.project.update({
        where: { id: proposal.project.id },
        data: { 
          status: 'IN_PROGRESS',
          freelancerId: proposal.user.id,
        },
      });
      console.log('Projeto atualizado:', updatedProject.id, 'Status:', updatedProject.status, 'FreelancerId:', updatedProject.freelancerId);

      console.log('3. Rejeitando outras propostas pendentes...');
      // 3. Rejeitar automaticamente todas as outras propostas pendentes do mesmo projeto
      const rejectedProposals = await tx.proposal.updateMany({
        where: {
          projectId: proposal.project.id,
          status: 'PENDING',
          id: { not: id }, // Excluir a proposta que foi aceita
        },
        data: { status: 'REJECTED' },
      });
      console.log('Propostas rejeitadas:', rejectedProposals.count);

      // Se temos marcos personalizados, criar contrato com eles
      if (customMilestones && customMilestones.length > 0) {
        console.log('4. Criando contrato com marcos personalizados...');
        
        // 4. Criar contrato automaticamente
        const newContract = await tx.contract.create({
          data: {
            projectId: proposal.project.id,
            freelancerId: proposal.user.id,
            companyId: user.id,
            totalAmount: proposal.budget,
            deadline: proposal.project.deadline
          }
        });
        console.log('Contrato criado:', newContract.id);

        console.log('5. Criando marcos personalizados...');
        // 5. Criar marcos personalizados
        const createdMilestones = await Promise.all(
          customMilestones.map(async (milestone: any) => {
            return await tx.milestone.create({
              data: {
                contractId: newContract.id,
                title: milestone.title,
                description: milestone.description,
                amount: milestone.amount,
                dueDate: new Date(milestone.dueDate),
                deliverables: JSON.stringify(milestone.deliverables)
              }
            });
          })
        );
        console.log('Marcos criados:', createdMilestones.length);

        return { 
          updatedProposal, 
          updatedProject, 
          rejectedCount: rejectedProposals.count,
          contract: newContract,
          milestonesCount: createdMilestones.length
        };
      } else {
        // Retornar sem contrato para permitir personalização no frontend
        return { 
          updatedProposal, 
          updatedProject, 
          rejectedCount: rejectedProposals.count,
          contract: null,
          milestonesCount: 0
        };
      }
    });

    console.log('=== TRANSAÇÃO CONCLUÍDA COM SUCESSO ===');
    console.log('Proposta aceita:', result.updatedProposal.id);
    console.log('Projeto ID:', proposal.project.id, 'agora está IN_PROGRESS');
    console.log('Outras propostas rejeitadas:', result.rejectedCount);

    // Verificar se o projeto realmente foi atualizado
    const finalProject = await prisma.project.findUnique({
      where: { id: proposal.project.id },
      select: { id: true, status: true, freelancerId: true }
    });
    console.log('Estado final do projeto:', finalProject);

    // Verificação de segurança
    if (finalProject?.status !== 'IN_PROGRESS') {
      console.error('ERRO CRÍTICO: Projeto não foi atualizado corretamente!');
      throw new Error('Falha na atualização do projeto');
    }

    return NextResponse.json({
      message: customMilestones ? 'Contrato criado com sucesso' : 'Proposta aceita - aguardando configuração de marcos',
      proposal: result.updatedProposal,
      project: {
        id: proposal.project.id,
        title: proposal.project.title,
        budget: proposal.project.budget,
        deadline: proposal.project.deadline,
        status: 'IN_PROGRESS',
        freelancer: {
          id: proposal.user.id,
          name: proposal.user.name,
        },
      },
      rejectedProposals: result.rejectedCount,
      contract: result.contract,
      milestonesCount: result.milestonesCount,
      needsMilestoneSetup: !customMilestones
    });
  } catch (error) {
    console.error('=== ERRO AO ACEITAR PROPOSTA ===', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  }
} 