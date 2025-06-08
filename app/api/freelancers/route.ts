import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('API /freelancers GET: Iniciando busca de freelancers');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const location = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('API: Parâmetros de busca:', { search, category, minPrice, maxPrice, location, page, limit });

    // Por enquanto, retornar dados mock para evitar erros
    // TODO: Implementar com Firestore futuramente
    const mockFreelancers = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        title: 'Desenvolvedor Full Stack',
        description: 'Desenvolvedor experiente em React, Node.js e bancos de dados.',
        hourlyRate: 50,
        location: 'São Paulo, SP',
        rating: 4.8,
        totalReviews: 25,
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        profilePicture: '/profiles/default-avatar.jpg',
        verified: true,
        completedProjects: 15,
        availability: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        title: 'Designer UX/UI',
        description: 'Designer especializada em interfaces modernas e experiência do usuário.',
        hourlyRate: 45,
        location: 'Rio de Janeiro, RJ',
        rating: 4.9,
        totalReviews: 18,
        skills: ['Figma', 'Adobe XD', 'Photoshop', 'User Research'],
        profilePicture: '/profiles/default-avatar.jpg',
        verified: true,
        completedProjects: 22,
        availability: 'available',
        createdAt: new Date().toISOString()
      }
    ];

    // Simular filtros simples
    let filteredFreelancers = mockFreelancers;
    
    if (search) {
      filteredFreelancers = filteredFreelancers.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      // Por enquanto não filtra por categoria já que não temos essa info no mock
    }

    if (location) {
      filteredFreelancers = filteredFreelancers.filter(f => 
        f.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Simular paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex);

    console.log('API: Freelancers obtidos com sucesso (mock):', paginatedFreelancers.length, 'resultados');
    
    return NextResponse.json({
      freelancers: paginatedFreelancers,
      pagination: {
        page,
        limit,
        total: filteredFreelancers.length,
        pages: Math.ceil(filteredFreelancers.length / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar freelancers:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}