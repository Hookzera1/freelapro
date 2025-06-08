import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        freelancerProfile: true,
        companyProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { userType, ...profileData } = data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    let updatedUser;

    if (user.userType === 'freelancer') {
      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: profileData.name,
          freelancerProfile: {
            upsert: {
              create: profileData,
              update: profileData,
            },
          },
        },
        include: {
          freelancerProfile: true,
        },
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: profileData.name,
          companyProfile: {
            upsert: {
              create: profileData,
              update: profileData,
            },
          },
        },
        include: {
          companyProfile: true,
        },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}