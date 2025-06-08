import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export const getUserById = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      companyName: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export const getProjectsByCompany = cache(async (companyId: string, limit = 10) => {
  return prisma.project.findMany({
    where: { 
      companyId,
    },
    include: {
      proposals: {
        select: {
          id: true,
          status: true,
        },
      },
      freelancer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
});

export const getProjectsByFreelancer = cache(async (freelancerId: string, limit = 10) => {
  return prisma.project.findMany({
    where: {
      OR: [
        { freelancerId },
        {
          proposals: {
            some: {
              userId: freelancerId,
            },
          },
        },
      ],
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          companyName: true,
          image: true,
        },
      },
      proposals: {
        where: {
          userId: freelancerId,
        },
        select: {
          id: true,
          status: true,
          value: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
  });
});

export const getProjectStats = cache(async (userId: string, userType: string) => {
  if (userType === 'company') {
    const [totalProjects, openProjects, totalProposals] = await Promise.all([
      prisma.project.count({ where: { companyId: userId } }),
      prisma.project.count({ where: { companyId: userId, status: 'OPEN' } }),
      prisma.proposal.count({
        where: {
          project: {
            companyId: userId,
          },
        },
      }),
    ]);

    return { totalProjects, openProjects, totalProposals };
  } else {
    const [activeProjects, totalProposals, acceptedProposals] = await Promise.all([
      prisma.project.count({
        where: {
          OR: [
            { freelancerId: userId },
            {
              proposals: {
                some: {
                  userId,
                  status: 'ACCEPTED',
                },
              },
            },
          ],
        },
      }),
      prisma.proposal.count({ where: { userId } }),
      prisma.proposal.count({ where: { userId, status: 'ACCEPTED' } }),
    ]);

    return { activeProjects, totalProposals, acceptedProposals };
  }
}); 