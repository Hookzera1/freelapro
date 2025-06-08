'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Briefcase, Users, PlusCircle, ChevronRight, Search, Clock, CheckCircle } from 'lucide-react';
import { useFetchAuth } from '@/hooks/useFetchAuth';
import { DashboardStats, FreelancerProject, FreelancerProposal } from '@/types/dashboard';
import RouteGuard from '@/app/components/RouteGuard';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { fetchAuth } = useFetchAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProposals: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProposals: 0
  });
  const [recentProjects, setRecentProjects] = useState<FreelancerProject[]>([]);
  const [recentProposals, setRecentProposals] = useState<FreelancerProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Redirecionar empresa para o dashboard específico
    if (user?.userType === 'company') {
      router.replace('/empresa/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Buscando dados do dashboard...');
        const [statsResponse, projectsResponse, proposalsResponse] = await Promise.all([
          fetchAuth('/api/freelancer/stats'),
          fetchAuth('/api/freelancer/projects/recent'),
          fetchAuth('/api/freelancer/proposals/recent')
        ]);

        if (!statsResponse.ok || !projectsResponse.ok || !proposalsResponse.ok) {
          throw new Error('Erro ao buscar dados');
        }

        const [statsData, projectsData, proposalsData] = await Promise.all([
          statsResponse.json(),
          projectsResponse.json(),
          proposalsResponse.json()
        ]);

        console.log('Dados recebidos:', {
          stats: statsData,
          projects: projectsData,
          proposals: proposalsData
        });

        setStats(statsData);
        setRecentProjects(projectsData);
        setRecentProposals(proposalsData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, router, loading, fetchAuth]);

  if (loading || isLoading) {
    return (
      <main className="container-custom py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  // Dashboard do Freelancer
  return (
    <RouteGuard allowedUserTypes={['freelancer']}>
      <main className="container-custom py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard do Freelancer</h1>
          <Link href="/buscar-projetos">
            <Button className="button-gradient">
              <Search className="w-4 h-4 mr-2" />
              Buscar Projetos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Propostas Enviadas</h3>
              <PlusCircle className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalProposals}</p>
            <p className="text-sm text-slate-500 mt-2">Total de propostas</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Projetos Ativos</h3>
              <Briefcase className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.activeProjects}</p>
            <p className="text-sm text-slate-500 mt-2">Em andamento</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Projetos Concluídos</h3>
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.completedProjects}</p>
            <p className="text-sm text-slate-500 mt-2">Finalizados</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Propostas Pendentes</h3>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.pendingProposals}</p>
            <p className="text-sm text-slate-500 mt-2">Aguardando resposta</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Projetos Recentes</h3>
              <Link href="/meus-projetos" className="text-blue-500 hover:text-blue-600 flex items-center">
                Ver todos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-slate-800">{project.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {project.company.name} • R$ {project.budget}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Nenhum projeto encontrado</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Propostas Recentes</h3>
              <Link href="/minhas-propostas" className="text-blue-500 hover:text-blue-600 flex items-center">
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentProposals.length > 0 ? (
                recentProposals.map((proposal) => (
                  <div key={proposal.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-slate-800">{proposal.project.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      R$ {proposal.value} • {proposal.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Nenhuma proposta encontrada</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </RouteGuard>
  );
}