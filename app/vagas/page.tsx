'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, DollarSign, Users, Briefcase, MapPin, Clock } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  createdAt: string;
  scope: string;
  technologies: string;
  type: string;
  level: string;
  status: string;
  company: {
    name: string;
    companyName: string | null;
  };
  _count: {
    proposals: number;
  };
}

export default function Vagas() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    level: '',
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Buscando vagas...');
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Erro ao carregar vagas');
        const data = await response.json();
        console.log('Vagas recebidas:', data);
        setJobs(data);
      } catch (err) {
        console.error('Erro ao buscar vagas:', err);
        setError('Ocorreu um erro ao carregar as vagas. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (filters.type && job.type !== filters.type) return false;
    if (filters.level && job.level !== filters.level) return false;
    return job.status === 'OPEN'; // Só mostrar projetos abertos
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'fixed':
        return 'Preço Fixo';
      case 'hourly':
        return 'Por Hora';
      case 'recurring':
        return 'Recorrente';
      default:
        return type;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'expert':
        return 'Especialista';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              <Briefcase className="w-8 h-8 mr-3 text-blue-500" />
              Vagas Disponíveis
            </h1>
            <p className="text-slate-600 mt-2">
              Encontre oportunidades perfeitas para você
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Projeto
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os Tipos</option>
                <option value="fixed">Preço Fixo</option>
                <option value="hourly">Por Hora</option>
                <option value="recurring">Recorrente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nível de Experiência
              </label>
              <select
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Qualquer Experiência</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="expert">Especialista</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ type: '', level: '' })}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-slate-800 line-clamp-2">
                    {job.title}
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    Aberta
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-slate-600">
                    {job.company.companyName || job.company.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Publicado em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <p className="text-slate-600 mb-4 line-clamp-3">
                  {job.description}
                </p>

                {job.technologies && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Tecnologias:</p>
                    <p className="text-sm text-slate-600">{job.technologies}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-blue-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="font-semibold">
                        R$ {job.budget.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{job._count.proposals} propostas</span>
                    </div>
                  </div>

                  <div className="flex items-center text-slate-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Prazo: {new Date(job.deadline).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{getTypeText(job.type)}</span>
                    </div>
                    <span className="text-slate-600">
                      {getLevelText(job.level)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link href={`/vagas/${job.id}`}>
                    <Button className="w-full button-gradient">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-slate-500">
              Tente ajustar os filtros ou volte mais tarde para novas oportunidades.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}