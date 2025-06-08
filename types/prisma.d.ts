import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaTypes {
    type UserType = 'freelancer' | 'company';
    
    interface User extends Prisma.UserGetPayload<{}> {
      userType: UserType;
    }
  }
} 