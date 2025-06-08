import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/config/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
  };
}

export async function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: Request) => {
    try {
      const session = await getServerSession(authOptions);
      console.log('Middleware - Verificando autenticação:', {
        hasSession: !!session,
        userPresent: !!session?.user,
        userType: session?.user?.userType
      });

      if (!session?.user) {
        console.log('Middleware - Usuário não autenticado');
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        );
      }

      // Adiciona informações do usuário à requisição
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: session.user.id,
        email: session.user.email!,
        userType: session.user.userType
      };

      console.log('Middleware - Usuário autenticado:', {
        id: authenticatedRequest.user.id,
        userType: authenticatedRequest.user.userType
      });

      return handler(authenticatedRequest);
    } catch (error) {
      console.error('Middleware - Erro na autenticação:', error);
      return NextResponse.json(
        { error: 'Erro na autenticação' },
        { status: 500 }
      );
    }
  };
}

export function withRole(handler: (request: AuthenticatedRequest) => Promise<NextResponse>, allowedRoles?: string[]) {
  return async (request: Request) => {
    try {
      const session = await getServerSession(authOptions);
      console.log('Middleware - Verificando roles:', {
        hasSession: !!session,
        userType: session?.user?.userType,
        allowedRoles
      });

      if (!session?.user) {
        console.log('Middleware - Usuário não autenticado');
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        );
      }

      // Verificar roles se especificadas
      if (allowedRoles && !allowedRoles.includes(session.user.userType)) {
        console.log('Middleware - Usuário sem permissão:', {
          userType: session.user.userType,
          allowedRoles
        });
        return NextResponse.json(
          { error: 'Acesso negado - Tipo de usuário não permitido' },
          { status: 403 }
        );
      }

      // Adiciona informações do usuário à requisição
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: session.user.id,
        email: session.user.email!,
        userType: session.user.userType
      };

      console.log('Middleware - Usuário autorizado:', {
        id: authenticatedRequest.user.id,
        userType: authenticatedRequest.user.userType
      });

      return handler(authenticatedRequest);
    } catch (error) {
      console.error('Middleware - Erro na autenticação:', error);
      return NextResponse.json(
        { error: 'Erro na autenticação' },
        { status: 500 }
      );
    }
  };
} 