import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      userType: 'freelancer' | 'company';
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType: 'freelancer' | 'company';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    accessToken?: string;
    refreshToken?: string;
    userType: 'freelancer' | 'company';
  }
} 