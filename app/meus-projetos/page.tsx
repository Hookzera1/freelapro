'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { PlusCircle, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
  createdAt: string;
  _count: {
    proposals: number;
  };
}

export default function MyProjects() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.userType !== 'company') {
      router.push('/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetchWithAuth(`/api/jobs?userId=${user.id}`);
        if (!response.ok) throw new Error('Erro ao buscar projetos');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, router]);

  if (isLoading) {
    return (
      <main className="container-custom py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Aberto
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Em Andamento
          </span>
        );
      case 'CLOSED':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Fechado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Projetos</h1>
        <Link href="/criar-projeto">
          <Button className="button-gradient">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar Novo Projeto
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Você ainda não tem projetos
          </h2>
          <p className="text-slate-600 mb-6">
            Comece criando seu primeiro projeto e encontre os melhores freelancers para sua empresa.
          </p>
          <Link href="/criar-projeto">
            <Button className="button-gradient">
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/projetos/${project.id}`}
                    className="text-xl font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    {project.title}
                  </Link>
                  <p className="text-slate-600 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                {getStatusBadge(project.status)}
              </div>

              <div className="mt-4 flex items-center gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{project._count.proposals} propostas</span>
                </div>
                <div>
                  Orçamento: R$ {project.budget.toLocaleString('pt-BR')}
                </div>
                <div>
                  Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <Link href={`/projetos/${project.id}`}>
                  <Button variant="outline">Ver Detalhes</Button>
                </Link>
                <Link href={`/projetos/${project.id}/propostas`}>
                  <Button variant="outline">
                    Ver Propostas ({project._count.proposals})
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
} 