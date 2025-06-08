import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '../auth/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID do projeto é obrigatório' },
        { status: 400 }
      );
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        projectId: projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    console.log('API Proposals - Criando proposta - Dados do usuário:', {
      userId: user.id,
      userType: user.userType
    });

    // Verificar se o usuário é freelancer
    if (user.userType !== 'freelancer') {
      console.log('API Proposals - Erro: Usuário não é freelancer:', user.userType);
      return NextResponse.json(
        { error: 'Apenas freelancers podem enviar propostas' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { value, description, projectId } = data;
    console.log('API Proposals - Dados recebidos:', data);

    if (!value || !description || !projectId) {
      return NextResponse.json(
        { error: 'Valor, descrição e ID do projeto são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar valor
    const proposalValue = parseFloat(value.toString());
    if (isNaN(proposalValue) || proposalValue <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser um número positivo' },
        { status: 400 }
      );
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Este projeto não está mais aceitando propostas' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já enviou uma proposta para este projeto
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        userId: user.id,
        projectId: projectId
      }
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: 'Você já enviou uma proposta para este projeto' },
        { status: 400 }
      );
    }

    console.log('API Proposals - Criando proposta no banco de dados');
    const proposal = await prisma.proposal.create({
      data: {
        budget: proposalValue,
        message: description,
        userId: user.id,
        projectId: projectId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            budget: true
          }
        }
      }
    });

    console.log('API Proposals - Proposta criada com sucesso:', {
      proposalId: proposal.id,
      projectId: proposal.projectId,
      userId: proposal.userId
    });

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('API Proposals - Erro ao criar proposta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar proposta' },
      { status: 500 }
    );
  }
}