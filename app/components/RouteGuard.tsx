'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: ('freelancer' | 'company')[];
}

export default function RouteGuard({ 
  children, 
  requireAuth = true, 
  allowedUserTypes 
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      console.log('RouteGuard: Usuário não autenticado, redirecionando para login');
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && allowedUserTypes && !allowedUserTypes.includes(user.userType || 'freelancer')) {
      console.log('RouteGuard: Tipo de usuário não permitido');
      router.replace('/');
      return;
    }
  }, [user, loading, router, requireAuth, allowedUserTypes, pathname]);

  if (loading) {
    console.log('RouteGuard - Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (user && allowedUserTypes && !allowedUserTypes.includes(user.userType || 'freelancer')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Acesso Negado</h1>
          <p className="text-slate-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Verificar se é uma rota que precisa de tipo de usuário específico
  const protectedRoutes = {
    '/empresa': ['company'],
    '/dashboard': ['freelancer']
  };

  for (const [route, allowedTypes] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route) && user && !allowedTypes.includes(user.userType || 'freelancer')) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Acesso Negado</h1>
            <p className="text-slate-600 mb-6">
              Esta página é exclusiva para {allowedTypes.includes('company') ? 'empresas' : 'freelancers'}.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
} 