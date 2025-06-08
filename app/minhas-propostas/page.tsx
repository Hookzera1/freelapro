'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/contexts/AuthContext';
import { useFetchAuth } from '@/hooks/useFetchAuth';

interface Proposal {
  id: string;
  budget: number;
  message: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    budget: number;
    company: {
      id: string;
      name: string;
      image: string | null;
    };
  };
}

export default function MyProposals() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchAuth } = useFetchAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (loading) return;

        if (!user) {
          console.log('Usuário não autenticado, redirecionando para login...');
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        await fetchProposals();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    const fetchProposals = async () => {
      try {
        if (!user) return;
        
        console.log('Buscando propostas para o usuário:', user.uid);
        const response = await fetchAuth('/api/proposals/my-proposals');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar propostas');
        }
        
        const data = await response.json();
        console.log('Propostas carregadas:', data.length);
        setProposals(data);
      } catch (err) {
        console.error('Erro ao carregar propostas:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar propostas');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, router, loading, fetchAuth, pathname]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Aceita';
      case 'REJECTED':
        return 'Recusada';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">
            Minhas Propostas
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-slate-600 mb-4">
                Você ainda não enviou nenhuma proposta
              </h2>
              <p className="text-slate-500 mb-8">
                Explore as vagas disponíveis e comece a enviar suas propostas.
              </p>
              <Link href="/vagas" className="btn-primary">
                Explorar Vagas
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {proposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/vagas/${proposal.project.id}`}
                        className="text-xl font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {proposal.project.title}
                      </Link>
                      <div className="text-slate-500 mt-1">
                        Enviada em{' '}
                        {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        R$ {proposal.budget.toLocaleString('pt-BR')}
                      </div>
                      <div className="flex items-center mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                            proposal.status
                          )}`}
                        >
                          {getStatusText(proposal.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">
                      Cliente
                    </h3>
                    <div className="flex items-center">
                      {proposal.project.company.image ? (
                        <img
                          src={proposal.project.company.image}
                          alt={proposal.project.company.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-sm font-medium text-blue-600">
                            {proposal.project.company.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-slate-600">
                        {proposal.project.company.name}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 mt-4 line-clamp-2">
                    {proposal.message}
                  </p>

                  <div className="flex justify-end mt-6">
                    <Link
                      href={`/vagas/${proposal.project.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Ver Projeto
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}