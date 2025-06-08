'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFetchAuth } from '@/hooks/useFetchAuth';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
  _count: {
    proposals: number;
  };
}

export default function MyJobs() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchAuth } = useFetchAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await fetchAuth('/api/jobs/my-jobs');
        if (!response.ok) {
          throw new Error('Erro ao carregar vagas');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, router, fetchAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Minhas Vagas</h1>
            <Link href="/publicar-vaga" className="btn-primary">
              Publicar Nova Vaga
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-slate-600 mb-4">
                Você ainda não publicou nenhuma vaga
              </h2>
              <p className="text-slate-500 mb-8">
                Comece publicando sua primeira vaga para encontrar profissionais
                qualificados.
              </p>
              <Link href="/publicar-vaga" className="btn-primary">
                Publicar Primeira Vaga
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/vagas/${job.id}`}
                        className="text-xl font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <div className="text-slate-500 mt-1">
                        Publicado em{' '}
                        {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        R$ {job.budget.toLocaleString('pt-BR')}
                      </div>
                      <div className="flex items-center mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            job.status === 'OPEN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {job.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                        </span>
                        <span className="ml-3 text-slate-500">
                          {job._count.proposals}{' '}
                          {job._count.proposals === 1
                            ? 'proposta'
                            : 'propostas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 mt-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex justify-end mt-6 space-x-4">
                    <Link
                      href={`/vagas/${job.id}`}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      Ver Detalhes
                    </Link>
                    <Link
                      href={`/vagas/${job.id}/editar`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
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