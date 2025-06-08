'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star,
  MapPin,
  Clock,
  DollarSign,
  User,
  Award,
  TrendingUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Eye,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface FreelancerProfile {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  skills?: string;
  location?: string;
  hourlyRate?: number;
  availability: string;
  rating?: number;
  reviewCount: number;
  completedJobs: number;
  userType: string;
  createdAt: string;
  portfolio?: Array<{
    id: string;
    title: string;
    category: string;
    featured: boolean;
    images: string[];
  }>;
  userSkills?: Array<{
    skill: {
      name: string;
      category: string;
    };
    level: number;
    yearsExp?: number;
    certified: boolean;
  }>;
}

interface SearchFilters {
  query: string;
  skills: string[];
  location: string;
  minRate: number;
  maxRate: number;
  minRating: number;
  availability: string;
  verified: boolean;
  sortBy: 'rating' | 'rate' | 'experience' | 'recent';
  category: string;
}

const skillCategories = [
  'programming',
  'design',
  'marketing',
  'writing',
  'business',
  'data',
  'mobile'
];

const categoryLabels: Record<string, string> = {
  programming: 'Programação',
  design: 'Design',
  marketing: 'Marketing',
  writing: 'Redação',
  business: 'Negócios',
  data: 'Dados & Analytics',
  mobile: 'Mobile'
};

const availabilityOptions = [
  { value: '', label: 'Qualquer' },
  { value: 'full-time', label: 'Tempo Integral' },
  { value: 'part-time', label: 'Meio Período' },
  { value: 'contract', label: 'Por Projeto' }
];

export default function FreelancerSearch() {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedFreelancers, setSavedFreelancers] = useState<string[]>([]);
  const { user } = useAuth();

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    skills: [],
    location: '',
    minRate: 0,
    maxRate: 1000,
    minRating: 0,
    availability: '',
    verified: false,
    sortBy: 'rating',
    category: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    searchFreelancers();
  }, [filters, pagination.page]);

  useEffect(() => {
    loadSavedFreelancers();
  }, []);

  const searchFreelancers = async () => {
    setLoading(true);
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        query: filters.query,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minRate > 0 && { minRate: filters.minRate.toString() }),
        ...(filters.maxRate < 1000 && { maxRate: filters.maxRate.toString() }),
        ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.verified && { verified: 'true' }),
        ...(filters.category && { category: filters.category })
      });

      const response = await fetch(`/api/freelancers/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const data = await response.json();
      setFreelancers(data.freelancers || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      }));
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar freelancers');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedFreelancers = async () => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch('/api/saved-freelancers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedFreelancers(data.savedIds || []);
      }
    } catch (error) {
      console.error('Erro ao carregar salvos:', error);
    }
  };

  const toggleSaveFreelancer = async (freelancerId: string) => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const isSaved = savedFreelancers.includes(freelancerId);
      
      const response = await fetch(`/api/saved-freelancers/${freelancerId}`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSavedFreelancers(prev => 
          isSaved 
            ? prev.filter(id => id !== freelancerId)
            : [...prev, freelancerId]
        );
        toast.success(isSaved ? 'Removido dos salvos' : 'Salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar/remover:', error);
      toast.error('Erro na operação');
    }
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      skills: [],
      location: '',
      minRate: 0,
      maxRate: 1000,
      minRating: 0,
      availability: '',
      verified: false,
      sortBy: 'rating',
      category: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header de Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Buscar freelancers por nome, skills ou especialidade..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              onKeyPress={(e) => e.key === 'Enter' && searchFreelancers()}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>
            
            <button
              onClick={searchFreelancers}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Todas as categorias</option>
                    {skillCategories.map(category => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Cidade ou estado"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa Horária (R$)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minRate}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRate: parseInt(e.target.value) || 0 }))}
                      placeholder="Min"
                      className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="number"
                      value={filters.maxRate}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxRate: parseInt(e.target.value) || 1000 }))}
                      placeholder="Max"
                      className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidade
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {availabilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação Mínima
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value={0}>Qualquer avaliação</option>
                    <option value={4}>4+ estrelas</option>
                    <option value={4.5}>4.5+ estrelas</option>
                    <option value={5}>5 estrelas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="rating">Melhor avaliação</option>
                    <option value="rate">Menor taxa</option>
                    <option value="experience">Mais experiente</option>
                    <option value="recent">Mais recente</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm text-gray-700">Apenas verificados</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {loading ? 'Buscando...' : `${pagination.total} freelancers encontrados`}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Página {pagination.page} de {pagination.pages}
        </div>
      </div>

      {/* Grid de Freelancers */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum freelancer encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou ampliar sua busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((freelancer, index) => (
            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header do Card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {freelancer.image ? (
                        <img 
                          src={freelancer.image} 
                          alt={freelancer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{freelancer.name}</h3>
                      {freelancer.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{freelancer.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSaveFreelancer(freelancer.id)}
                    className={`p-2 rounded-full transition-colors ${
                      savedFreelancers.includes(freelancer.id)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${
                      savedFreelancers.includes(freelancer.id) ? 'fill-current' : ''
                    }`} />
                  </button>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {freelancer.bio || 'Freelancer profissional disponível para novos projetos.'}
                </p>

                {/* Skills principais */}
                {freelancer.userSkills && freelancer.userSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {freelancer.userSkills.slice(0, 3).map((userSkill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {userSkill.skill.name}
                        {userSkill.certified && <Award className="w-3 h-3" />}
                      </span>
                    ))}
                    {freelancer.userSkills.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{freelancer.userSkills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {renderStars(freelancer.rating || 0)}
                      <span className="text-sm font-medium text-gray-900">
                        {freelancer.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {freelancer.reviewCount} avaliações
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {freelancer.completedJobs}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">projetos concluídos</p>
                  </div>
                </div>

                {/* Preço e Disponibilidade */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      {freelancer.hourlyRate 
                        ? `R$ ${freelancer.hourlyRate}/h`
                        : 'A negociar'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 capitalize">
                      {availabilityOptions.find(opt => opt.value === freelancer.availability)?.label || 'Disponível'}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contratar
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.pages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`px-3 py-2 rounded-lg ${
                    pageNum === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
} 