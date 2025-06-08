'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Star, MapPin, Briefcase, ArrowRight, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  hourlyRate: number;
  rating: string;
  skills: string[];
  completedProjects: number;
  acceptedProposals: number;
  imageUrl: string;
  email: string;
  website?: string;
  github?: string;
  linkedin?: string;
  joinedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function TalentsPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [error, setError] = useState<string | null>(null);

  const skills = [
    'Todos',
    'React',
    'Node.js',
    'UI/UX',
    'Python',
    'Marketing',
    'Design',
    'JavaScript',
    'TypeScript',
    'PHP',
    'WordPress'
  ];

  const fetchFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSkill && selectedSkill !== 'all' && selectedSkill !== 'todos') {
        params.append('skills', selectedSkill);
      }
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      console.log('Buscando freelancers com parâmetros:', params.toString());
      
      const response = await fetch(`/api/freelancers?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      setFreelancers(data.freelancers || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erro ao buscar freelancers:', error);
      setError('Erro ao carregar talentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSkill, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSkillFilter = (skill: string) => {
    setSelectedSkill(skill.toLowerCase());
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-purple-100/50 to-pink-100/50" />
        <div className="absolute inset-0 hero-pattern opacity-5" />
        
        <div className="container-custom relative py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Encontre os Melhores{' '}
              <span className="gradient-text">Talentos Freelance</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Conecte-se com {pagination.total > 0 ? `${pagination.total} profissionais` : 'profissionais'} talentosos e experientes para transformar suas ideias em realidade.
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar talentos por nome ou habilidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-gradient w-full px-6 py-4 rounded-xl text-slate-800 placeholder-slate-400"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 button-gradient"
              >
                <Search className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Skills Filter */}
      <section className="py-8 section-gradient border-y border-white/30">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4 justify-center">
            {skills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillFilter(skill)}
                className={`tag-gradient px-6 py-2 rounded-full transition-all duration-300 
                  ${selectedSkill === skill.toLowerCase()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'hover:shadow-md hover:scale-105'
                  }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={fetchFreelancers}
                  className="mt-4 button-gradient"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Freelancers Grid */}
      {!loading && !error && (
        <section className="py-16">
          <div className="container-custom">
            {freelancers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  Nenhum talento encontrado
                </h3>
                <p className="text-slate-500 mb-6">
                  Tente ajustar os filtros ou a busca para encontrar profissionais.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSkill('all');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  variant="outline"
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="flex justify-between items-center mb-8">
                  <p className="text-slate-600">
                    {pagination.total > 0 && (
                      <>
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} talentos
                        {searchTerm && ` para "${searchTerm}"`}
                        {selectedSkill && selectedSkill !== 'all' && ` com skill "${selectedSkill}"`}
                      </>
                    )}
                  </p>
                </div>

                {/* Freelancers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {freelancers.map((freelancer) => (
                    <motion.div
                      key={freelancer.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="feature-card group"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar
                            src={freelancer.imageUrl}
                            alt={freelancer.name}
                            size="lg"
                            fallbackText={freelancer.name}
                          />
                          <div>
                            <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {freelancer.name}
                            </h3>
                            <p className="text-slate-600">{freelancer.title}</p>
                          </div>
                        </div>

                        <p className="text-slate-600 mb-4 line-clamp-3">
                          {freelancer.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {freelancer.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="tag-gradient px-3 py-1 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancer.skills.length > 4 && (
                            <span className="tag-gradient px-3 py-1 text-sm rounded-full">
                              +{freelancer.skills.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span>{freelancer.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{freelancer.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4 text-blue-500" />
                              <span>{freelancer.completedProjects} projetos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>R$ {freelancer.hourlyRate}/h</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-blue-100">
                            <Link href={`/perfil/${freelancer.id}`}>
                              <Button className="button-gradient w-full">
                                Ver Perfil
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Anterior
                    </Button>
                    
                    {[...Array(pagination.pages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === pagination.page;
                      const isNearCurrentPage = Math.abs(page - pagination.page) <= 2;
                      const isFirstOrLast = page === 1 || page === pagination.pages;
                      
                      if (!isNearCurrentPage && !isFirstOrLast) {
                        if (page === 2 || page === pagination.pages - 1) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={isCurrentPage ? "primary" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className={isCurrentPage ? "button-gradient" : ""}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!loading && (
        <section className="py-24 section-gradient border-y border-white/30">
          <div className="container-custom">
            <div className="cta-section">
              <div className="relative p-12 md:p-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="max-w-2xl"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                    É um profissional{' '}
                    <span className="gradient-text">talentoso</span>?
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Junte-se à nossa comunidade de freelancers e encontre os melhores projetos para suas habilidades.
                  </p>
                  <Link href="/registro">
                    <Button size="lg" className="button-gradient">
                      Criar Perfil Profissional
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 