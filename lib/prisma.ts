import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

interface User {
  name: string | null;
}

interface QueryInfo {
  model: string;
  operation: string;
  args: any;
  query: (args: any) => Promise<any>;
}

const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Erro ao inicializar Prisma Client:', error);
    throw error;
  }
};

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma }; 