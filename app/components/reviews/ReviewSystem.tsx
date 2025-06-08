'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  StarHalf,
  MessageSquare, 
  Calendar,
  Award,
  TrendingUp,
  User,
  Building,
  Filter,
  Plus,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment?: string;
  skills?: any;
  criteria?: any;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    image?: string;
    userType: string;
    companyName?: string;
  };
  reviewee: {
    id: string;
    name: string;
    image?: string;
    userType: string;
    companyName?: string;
  };
  contract: {
    project: {
      title: string;
    };
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ReviewSystemProps {
  userId: string;
  type?: 'received' | 'given';
  showCreateButton?: boolean;
  contractId?: string; // Para criar review de contrato específico
}

export default function ReviewSystem({ 
  userId, 
  type = 'received', 
  showCreateButton = false,
  contractId 
}: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const { user } = useAuth();

  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    criteria: {
      quality: 0,
      communication: 0,
      timeliness: 0,
      professionalism: 0
    }
  });

  useEffect(() => {
    loadReviews();
  }, [userId, type, filter]);

  const loadReviews = async () => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        userId,
        type,
        ...(filter !== 'all' && { rating: filter })
      });

      const response = await fetch(`/api/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { averageRating: 0, totalReviews: 0 });
    } catch (error) {
      console.error('Erro ao carregar reviews:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async () => {
    if (!newReview.rating || !newReview.title.trim()) {
      toast.error('Rating e título são obrigatórios');
      return;
    }

    try {
      if (!user || !contractId) return;
      
      const token = await user.getIdToken();
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractId,
          revieweeId: userId,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          criteria: newReview.criteria
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar review');
      }

      toast.success('Avaliação criada com sucesso!');
      setShowCreateForm(false);
      setNewReview({
        rating: 0,
        title: '',
        comment: '',
        criteria: { quality: 0, communication: 0, timeliness: 0, professionalism: 0 }
      });
      loadReviews();
    } catch (error: any) {
      console.error('Erro ao criar review:', error);
      toast.error(error.message || 'Erro ao criar avaliação');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : star - 0.5 <= rating
                ? 'text-yellow-400 fill-yellow-200'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = (currentRating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const criteriaLabels = {
    quality: 'Qualidade',
    communication: 'Comunicação',
    timeliness: 'Pontualidade',
    professionalism: 'Profissionalismo'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'received' ? 'Avaliações Recebidas' : 'Avaliações Dadas'}
          </h2>
          {showCreateButton && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Avaliar
            </button>
          )}
        </div>

        {type === 'received' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {renderStars(stats.averageRating, 'lg')}
                <span className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-gray-600">Avaliação Média</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews}
                </span>
              </div>
              <p className="text-gray-600">Total de Avaliações</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews > 0 ? Math.round((stats.averageRating / 5) * 100) : 0}%
                </span>
              </div>
              <p className="text-gray-600">Taxa de Satisfação</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          <div className="flex gap-2">
            {['all', '5', '4', '3', '2', '1'].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating as any)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating === 'all' ? 'Todas' : `${rating} ⭐`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário de Criação */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Criar Nova Avaliação
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação Geral
                </label>
                {renderInteractiveStars(newReview.rating, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Avaliação
                </label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Excelente trabalho, muito profissional"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentário (Opcional)
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Descreva sua experiência trabalhando com este profissional..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Critérios Específicos
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(criteriaLabels).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <span className="text-sm text-gray-600">{label}</span>
                      {renderInteractiveStars(newReview.criteria[key as keyof typeof newReview.criteria], (rating) => 
                        setNewReview(prev => ({ 
                          ...prev, 
                          criteria: { ...prev.criteria, [key]: rating }
                        }))
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={createReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Publicar Avaliação
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-600">
              {type === 'received' 
                ? 'Você ainda não recebeu avaliações.' 
                : 'Você ainda não fez avaliações.'}
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.reviewer.image ? (
                      <img 
                        src={review.reviewer.image} 
                        alt={review.reviewer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewer.companyName || review.reviewer.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {review.reviewer.userType === 'company' ? (
                        <Building className="w-4 h-4 text-gray-500" />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {review.reviewer.userType === 'company' ? 'Empresa' : 'Freelancer'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <span>Projeto: {review.contract.project.title}</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Avaliação verificada</span>
                </div>
              </div>
              
              {review.criteria && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Critérios Específicos:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(JSON.parse(review.criteria)).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {criteriaLabels[key as keyof typeof criteriaLabels]}
                        </span>
                        {renderStars(value as number, 'sm')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 