import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth';

// GET - Buscar itens do portfolio
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
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    if (featured) {
      whereClause.featured = true;
    }

    const [items, total] = await Promise.all([
      prisma.portfolio.findMany({
        where: whereClause,
        orderBy: [
          { featured: 'desc' }, // Projetos em destaque primeiro
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.portfolio.count({ where: whereClause })
    ]);

    // Parse dos campos JSON
    const parsedItems = items.map(item => ({
      ...item,
      technologies: item.technologies ? JSON.parse(item.technologies as string) : [],
      images: item.images ? JSON.parse(item.images as string) : [],
      links: item.links ? JSON.parse(item.links as string) : []
    }));

    return NextResponse.json({
      items: parsedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar portfolio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo item do portfolio
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
      title,
      description,
      technologies = [],
      images = [],
      links = [],
      category,
      featured = false,
      completedAt,
      clientName,
      projectValue
    } = await request.json();

    // Validações
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Título, descrição e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    const userId = decodedToken.uid;

    // Criar o item do portfolio
    const portfolioItem = await prisma.portfolio.create({
      data: {
        userId,
        title,
        description,
        technologies: JSON.stringify(technologies),
        images: JSON.stringify(images),
        links: JSON.stringify(links),
        category,
        featured,
        completedAt: completedAt ? new Date(completedAt) : null,
        clientName: clientName || null,
        projectValue: projectValue || null
      }
    });

    // Parse dos campos JSON para retorno
    const parsedItem = {
      ...portfolioItem,
      technologies: JSON.parse(portfolioItem.technologies as string),
      images: JSON.parse(portfolioItem.images as string),
      links: JSON.parse(portfolioItem.links as string)
    };

    return NextResponse.json({
      item: parsedItem,
      message: 'Item do portfolio criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar item do portfolio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 