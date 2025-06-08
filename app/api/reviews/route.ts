import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// GET - Buscar reviews de um usuário
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received'; // 'received' ou 'given'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const whereClause = type === 'received' 
      ? { revieweeId: userId, isPublic: true }
      : { reviewerId: userId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
              userType: true,
              companyName: true
            }
          },
          reviewee: {
            select: {
              id: true,
              name: true,
              image: true,
              userType: true,
              companyName: true
            }
          },
          contract: {
            include: {
              project: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: whereClause })
    ]);

    // Calcular estatísticas
    const stats = await prisma.review.aggregate({
      where: { revieweeId: userId, isPublic: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova review
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

    const {
      contractId,
      revieweeId,
      rating,
      title,
      comment,
      skills,
      criteria,
      isPublic = true
    } = await request.json();

    // Validações
    if (!contractId || !revieweeId || !rating || !title) {
      return NextResponse.json(
        { error: 'contractId, revieweeId, rating e title são obrigatórios' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating deve ser entre 1 e 5' },
        { status: 400 }
      );
    }

    const reviewerId = decodedToken.uid;

    // Verificar se o contrato existe e se o usuário tem permissão
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: { select: { title: true } }
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário faz parte do contrato
    if (contract.freelancerId !== reviewerId && contract.companyId !== reviewerId) {
      return NextResponse.json({ error: 'Não autorizado para este contrato' }, { status: 403 });
    }

    // Verificar se já existe review do usuário para este contrato
    const existingReview = await prisma.review.findUnique({
      where: {
        contractId_reviewerId: {
          contractId,
          reviewerId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Você já avaliou este contrato' },
        { status: 400 }
      );
    }

    // Criar a review
    const review = await prisma.review.create({
      data: {
        contractId,
        reviewerId,
        revieweeId,
        rating,
        title,
        comment,
        skills: skills ? JSON.stringify(skills) : undefined,
        criteria: criteria ? JSON.stringify(criteria) : undefined,
        isPublic
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
            userType: true,
            companyName: true
          }
        },
        contract: {
          include: {
            project: {
              select: { title: true }
            }
          }
        }
      }
    });

    // Atualizar estatísticas do usuário avaliado
    const userStats = await prisma.review.aggregate({
      where: { revieweeId, isPublic: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        rating: userStats._avg.rating || 0,
        reviewCount: userStats._count.rating || 0
      }
    });

    // Criar notificação
    const reviewerName = review.reviewer.companyName || review.reviewer.name || 'Usuário';
    await createNotification({
      userId: revieweeId,
      type: 'REVIEW_RECEIVED',
      title: 'Nova Avaliação Recebida',
      message: `${reviewerName} avaliou seu trabalho no projeto "${contract.project.title}" com ${rating} estrelas`,
      relatedId: contractId,
      relatedType: 'contract'
    });

    return NextResponse.json({
      review,
      message: 'Review criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 