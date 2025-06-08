'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFetchAuth } from '@/hooks/useFetchAuth';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  createdAt: string;
  company: {
    name: string;
    image?: string;
  };
  _count: {
    proposals: number;
  };
}

export default function SearchProjects() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { fetchAuth } = useFetchAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Se ainda está carregando o estado de autenticação, aguardar
        if (loading) return;

        // Se não há usuário após carregar, redirecionar para login
        if (!user) {
          console.log('Usuário não autenticado, redirecionando para login...');
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        await fetchJobs();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    };

    checkAuth();
  }, [user, router, loading, fetchAuth]);

  const fetchJobs = async () => {
    try {
      console.log('Buscando projetos...');
      const response = await fetchAuth('/api/freelancer/recommended-jobs');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar projetos: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Projetos carregados com sucesso:', data.length);
      setJobs(data);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
      setError('Erro ao carregar projetos. Tente novamente mais tarde.');
      if (err instanceof Error && err.message.includes('401')) {
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedSkills.length === 0) return matchesSearch;
    
    return matchesSearch && selectedSkills.some(skill => 
      job.skills.includes(skill)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Buscar Projetos</h1>
          </div>

          {/* Barra de Pesquisa */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading || isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-slate-600 mb-4">
                Nenhum projeto encontrado
              </h2>
              <p className="text-slate-500">
                Tente ajustar seus filtros de busca ou volte mais tarde.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {job.company.image ? (
                        <img
                          src={job.company.image}
                          alt={job.company.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-medium text-blue-600">
                            {job.company.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/vagas/${job.id}`}
                          className="text-xl font-semibold text-slate-800 hover:text-blue-600"
                        >
                          {job.title}
                        </Link>
                        <div className="text-slate-500 mt-1">
                          {job.company.name} • {job._count.proposals} propostas
                        </div>
                        <p className="text-slate-600 mt-2 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        R$ {job.budget.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
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