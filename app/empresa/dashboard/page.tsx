'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Briefcase, Users, PlusCircle, ChevronRight } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface CompanyStats {
  totalProjects: number;
  activeProjects: number;
  totalProposals: number;
  pendingProposals: number;
}

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  createdAt: string;
}

interface Proposal {
  id: string;
  projectTitle: string;
  freelancerName: string;
  value: number;
  status: string;
  createdAt: string;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<CompanyStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalProposals: 0,
    pendingProposals: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirecionar freelancer para o dashboard específico
    if (user.userType === 'freelancer') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsResponse, projectsResponse, proposalsResponse] = await Promise.all([
          fetchWithAuth('/api/company/stats'),
          fetchWithAuth('/api/company/projects/recent'),
          fetchWithAuth('/api/company/proposals/recent')
        ]);

        if (statsResponse.status === 404) {
          setNeedsMigration(true);
          return;
        }

        if (!statsResponse.ok || !projectsResponse.ok || !proposalsResponse.ok) {
          throw new Error('Erro ao buscar dados');
        }

        const [statsData, projectsData, proposalsData] = await Promise.all([
          statsResponse.json(),
          projectsResponse.json(),
          proposalsResponse.json()
        ]);

        setStats(statsData);
        setRecentProjects(projectsData);
        setRecentProposals(proposalsData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      const response = await fetchWithAuth('/api/users/migrate', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Erro ao migrar usuário');
      }

      // Recarregar a página após migração bem-sucedida
      window.location.reload();
    } catch (error) {
      console.error('Erro na migração:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container-custom py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (needsMigration) {
    return (
      <main className="container-custom py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-semibold mb-4">Migração Necessária</h2>
          <p className="text-slate-600 mb-6 text-center">
            Precisamos migrar seus dados para o novo sistema. 
            Isso é necessário apenas uma vez e levará alguns segundos.
          </p>
          <Button
            onClick={handleMigration}
            disabled={isMigrating}
            className="button-gradient"
          >
            {isMigrating ? 'Migrando...' : 'Migrar Dados'}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard da Empresa</h1>
        <Link href="/criar-vaga">
          <Button className="button-gradient">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar Nova Vaga
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Total de Projetos</h3>
            <Briefcase className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalProjects}</p>
          <p className="text-sm text-slate-500 mt-2">Projetos publicados</p>
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
            <h3 className="text-lg font-semibold text-slate-700">Total de Propostas</h3>
            <Users className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalProposals}</p>
          <p className="text-sm text-slate-500 mt-2">Recebidas</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Propostas Pendentes</h3>
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.pendingProposals}</p>
          <p className="text-sm text-slate-500 mt-2">Aguardando análise</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">Projetos Recentes</h3>
            <Link href="/empresa/minhas-vagas" className="text-blue-500 hover:text-blue-600 flex items-center">
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
                    R$ {project.budget} • {project.status}
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
            <Link href="/empresa/propostas" className="text-blue-500 hover:text-blue-600 flex items-center">
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentProposals.length > 0 ? (
              recentProposals.map((proposal) => (
                <div key={proposal.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium text-slate-800">{proposal.projectTitle}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {proposal.freelancerName} • R$ {proposal.value}
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
  );
}