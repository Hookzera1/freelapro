'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth';

export default function SocialRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uid = searchParams.get('uid');
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  // Redirecionar se o usuário já estiver autenticado e com tipo definido
  useEffect(() => {
    if (isAuthenticated && user?.userType) {
      if (user.userType === 'company') {
        router.push('/empresa/dashboard');
      } else if (user.userType === 'freelancer') {
        router.push('/dashboard');
      } else {
        router.push('/vagas');
      }
    }
  }, [user, router, isAuthenticated]);

  if (!uid || !email || !name) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600">Erro</h1>
            <p className="mt-2 text-slate-600">
              Dados incompletos para registro. Por favor, tente fazer login novamente.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUserTypeSelection = async (userType: 'freelancer' | 'company') => {
    setError(null);
    setLoading(true);

    try {
      console.log('Completando registro social...');
      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid,
          email,
          name,
          userType,
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registro completado com sucesso, redirecionando...');
        // Aguardar um momento para garantir que o estado foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (userType === 'company') {
          router.push('/empresa/dashboard');
        } else if (userType === 'freelancer') {
          router.push('/dashboard');
        } else {
          router.push('/vagas');
        }
      } else {
        console.error('Erro ao completar registro:', data.error);
        setError(data.error || 'Erro ao completar registro');
      }
    } catch (err) {
      console.error('Erro ao completar registro:', err);
      setError('Erro ao completar registro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Bem-vindo ao Freela Connect
            </h1>
            <p className="text-slate-600 mt-2">
              Para continuar, selecione como você deseja usar a plataforma
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleUserTypeSelection('freelancer')}
              disabled={loading}
              className="w-full p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Sou Freelancer
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Quero oferecer meus serviços e encontrar projetos
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleUserTypeSelection('company')}
              disabled={loading}
              className="w-full p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Sou Empresa
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Quero contratar freelancers e publicar projetos
                  </p>
                </div>
              </div>
            </button>
          </div>

          {loading && (
            <div className="mt-6 text-center text-slate-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Processando...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 