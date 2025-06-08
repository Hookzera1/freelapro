'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { AccessDenied } from './AccessDenied';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedUserTypes?: ('freelancer' | 'company')[];
  requireAuth?: boolean;
  requireVerified?: boolean;
  redirectTo?: string;
  customDeniedMessage?: React.ReactNode;
  customDeniedSuggestion?: React.ReactNode;
}

export function RouteGuard({
  children,
  allowedUserTypes,
  requireAuth = true,
  requireVerified = true,
  redirectTo = '/',
  customDeniedMessage,
  customDeniedSuggestion
}: RouteGuardProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      console.log('RouteGuard - Estado detalhado:', {
        loading,
        userPresent: !!user,
        userType: user?.userType,
        userEmail: user?.email,
        isAuthenticated,
        requireAuth,
        requireVerified,
        allowedUserTypes,
        currentPath: window.location.pathname
      });

      // Se ainda está carregando, não faz nada
      if (loading) {
        console.log('RouteGuard - Ainda carregando, aguardando...');
        setShouldRender(false);
        setShowAccessDenied(false);
        return;
      }

      // Se não requer autenticação, renderiza normalmente
      if (!requireAuth) {
        console.log('RouteGuard - Autenticação não requerida, liberando acesso');
        setShouldRender(true);
        setShowAccessDenied(false);
        return;
      }

      // Se requer autenticação mas não há usuário autenticado
      if (!isAuthenticated || !user) {
        console.log('RouteGuard - PROBLEMA: Usuário não autenticado', {
          isAuthenticated,
          userExists: !!user,
          token: !!localStorage.getItem('authToken')
        });
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Se requer verificação de email
      if (requireVerified && !user.emailVerified) {
        console.log('RouteGuard - Email não verificado', {
          emailVerified: user.emailVerified
        });
        setShouldRender(false);
        setShowAccessDenied(true);
        return;
      }

      // Se há tipos de usuário permitidos
      if (allowedUserTypes && allowedUserTypes.length > 0) {
        console.log('RouteGuard - Verificando tipo de usuário:', {
          userType: user.userType,
          allowedTypes: allowedUserTypes,
          isAllowed: allowedUserTypes.includes(user.userType as 'freelancer' | 'company')
        });

        if (!allowedUserTypes.includes(user.userType as 'freelancer' | 'company')) {
          console.log('RouteGuard - PROBLEMA: Tipo de usuário não permitido');
          setShouldRender(false);
          setShowAccessDenied(true);
          return;
        }
      }

      console.log('RouteGuard - ✅ Todas as verificações passaram, liberando acesso');
      setShouldRender(true);
      setShowAccessDenied(false);
    };

    checkAuth();
  }, [user, loading, isAuthenticated, requireAuth, requireVerified, allowedUserTypes, router]);

  // Se ainda está carregando, mostra loading
  if (loading) {
    console.log('RouteGuard - Mostrando loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se deve mostrar acesso negado
  if (showAccessDenied) {
    console.log('RouteGuard - Mostrando acesso negado');
    return (
      <AccessDenied
        message={customDeniedMessage || "Você não tem permissão para acessar esta página"}
        suggestion={customDeniedSuggestion || "Por favor, faça login com uma conta que tenha as permissões necessárias"}
        redirectTo={redirectTo}
      />
    );
  }

  // Se não deve renderizar (aguardando verificações)
  if (!shouldRender) {
    console.log('RouteGuard - Aguardando verificações...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  console.log('RouteGuard - ✅ Renderizando conteúdo');
  return <>{children}</>;
} 