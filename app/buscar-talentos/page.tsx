'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FreelancerSearch from '@/app/components/marketplace/FreelancerSearch';
import { Search, Users, Star, MapPin } from 'lucide-react';

export default function BuscarTalentosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buscar Talentos</h1>
              <p className="text-gray-600">
                Encontre os melhores freelancers para seus projetos
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profissionais</p>
                  <p className="text-2xl font-bold text-gray-900">1000+</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bem Avaliados</p>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cidades</p>
                  <p className="text-2xl font-bold text-gray-900">100+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips for Companies */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 Dicas para Encontrar o Melhor Talento
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Use filtros específicos como categoria e nível de experiência</li>
              <li>• Verifique o portfolio e avaliações dos freelancers</li>
              <li>• Considere a disponibilidade e faixa de preço</li>
              <li>• Leia os comentários de outros clientes</li>
            </ul>
          </div>
        </div>

        {/* Freelancer Search */}
        <FreelancerSearch />
      </div>
    </div>
  );
} 