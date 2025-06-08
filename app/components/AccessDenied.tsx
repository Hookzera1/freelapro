'use client';

import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface AccessDeniedProps {
  message?: React.ReactNode;
  suggestion?: React.ReactNode;
  redirectTo?: string;
  redirectLabel?: string;
}

export function AccessDenied({
  message = 'Você não tem permissão para acessar esta página',
  suggestion = 'Por favor, faça login com uma conta que tenha as permissões necessárias',
  redirectTo = '/',
  redirectLabel = 'Voltar para a página inicial'
}: AccessDeniedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleRedirect = () => {
    if (redirectTo === '/login') {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <Shield className="h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acesso Negado
          </h2>
        </div>
        <div className="mt-2">
          <p className="text-lg text-gray-600">
            {message}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {suggestion}
          </p>
        </div>
        <div className="mt-5">
          <Button
            onClick={handleRedirect}
            className="w-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {user ? 'Voltar para o Dashboard' : 'Fazer Login'}
          </Button>
        </div>
      </div>
    </div>
  );
} 