import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Auth: Credenciais incompletas');
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          console.log('Auth: Verificando credenciais para:', credentials.email);
          const userRecord = await auth.getUserByEmail(credentials.email);
          
          // Buscar informações adicionais do usuário no Prisma
          const dbUser = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              userType: true,
              image: true,
              emailVerified: true
            }
          });

          if (!dbUser) {
            console.log('Auth: Usuário não encontrado no banco de dados');
            throw new Error('Usuário não encontrado');
          }

          console.log('Auth: Usuário autenticado:', {
            id: userRecord.uid,
            email: userRecord.email,
            userType: dbUser.userType
          });

          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName || dbUser.name,
            image: userRecord.photoURL || dbUser.image,
            userType: dbUser.userType,
            emailVerified: dbUser.emailVerified
          };
        } catch (error) {
          console.error('Auth: Erro ao autenticar:', error);
          throw new Error('Credenciais inválidas');
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Verificar se o usuário já existe no Prisma
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Criar usuário no Prisma se não existir
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date()
              }
            });
          }
        } catch (error) {
          console.error('Erro ao processar login com Google:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.userType = token.userType as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}; 