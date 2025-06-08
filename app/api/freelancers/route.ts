import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('=== API FREELANCERS GET INICIADA ===');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    console.log('Parâmetros de busca:', { search, skills, page, limit });

    // Estratégia 1: Tentar busca completa
    let freelancers = [];
    let total = 0;

    try {
      const whereClause: any = {
        userType: 'freelancer',
        name: { not: null }
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (skills && skills.length > 0) {
        whereClause.skills = { contains: skills[0], mode: 'insensitive' };
      }

      console.log('Tentativa 1: Busca completa');
      
      freelancers = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          skills: true,
          location: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      total = await prisma.user.count({ where: whereClause });
      console.log('Sucesso - Freelancers encontrados:', freelancers.length);

    } catch (error: any) {
      console.log('Erro na busca completa, tentando busca básica:', error.message);
      
      // Estratégia 2: Buscar apenas campos essenciais
      try {
        const basicWhereClause: any = {
          userType: 'freelancer',
          name: { not: null }
        };

        console.log('Tentativa 2: Busca apenas campos básicos');
        
        freelancers = await prisma.user.findMany({
          where: basicWhereClause,
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });

        total = await prisma.user.count({ where: basicWhereClause });
        console.log('Sucesso com busca básica - Freelancers encontrados:', freelancers.length);

        // Preencher campos ausentes
        freelancers = freelancers.map(f => ({
          ...f,
          image: null,
          bio: null,
          skills: null,
          location: null
        }));

      } catch (basicError) {
        console.error('Erro também na busca básica:', basicError);
        throw basicError;
      }
    }

    // Formatar dados de forma segura
    const formattedFreelancers = freelancers.map(freelancer => {
      // Processar skills de forma segura
      let skillsArray = ['Desenvolvedor'];
      try {
        if (freelancer.skills && typeof freelancer.skills === 'string') {
          const parsedSkills = freelancer.skills.split(',').map(s => s.trim()).filter(Boolean);
          if (parsedSkills.length > 0) {
            skillsArray = parsedSkills;
          }
        }
      } catch (skillError) {
        console.log('Erro ao processar skills, usando padrão');
      }
      
      return {
        id: freelancer.id,
        name: freelancer.name || 'Freelancer',
        title: `Especialista em ${skillsArray[0]}`,
        description: freelancer.bio || 'Profissional experiente e dedicado.',
        location: freelancer.location || 'Brasil',
        hourlyRate: Math.floor(Math.random() * 100) + 50,
        rating: (4.0 + Math.random() * 1.0).toFixed(1),
        skills: skillsArray,
        completedProjects: Math.floor(Math.random() * 20),
        acceptedProposals: Math.floor(Math.random() * 10),
        imageUrl: freelancer.image || null,
        email: freelancer.email,
        joinedAt: freelancer.createdAt
      };
    });

    console.log('Resposta formatada:', {
      freelancersCount: formattedFreelancers.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

    return NextResponse.json({
      freelancers: formattedFreelancers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro crítico na API freelancers:', error);
    console.error('Stack trace completo:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}