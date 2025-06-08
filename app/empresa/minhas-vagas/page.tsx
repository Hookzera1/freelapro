'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import RouteGuard from '@/app/components/RouteGuard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Briefcase, PlusCircle, Calendar, DollarSign, Users } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
  deadline: string;
  scope: string;
  technologies: string;
  type: string;
  level: string;
  _count: {
    proposals: number;
  };
  company: {
    name: string;
    companyName: string | null;
  };
}

export default function MinhasVagas() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Buscando projetos da empresa...');
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showToast('Token de autenticação não encontrado', 'error');
          return;
        }

        const response = await fetch('/api/company/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Projetos recebidos:', data);
        setProjects(data);
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        showToast('Erro ao carregar projetos', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user, showToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Aberta';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluída';
      default:
        return status;
    }
  };

  return (
    <RouteGuard allowedUserTypes={['company']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Briefcase className="w-8 h-8 mr-3 text-blue-500" />
            Minhas Vagas
          </h1>
          <Link href="/empresa/publicar-projeto">
            <Button className="button-gradient">
              <PlusCircle className="w-4 h-4 mr-2" />
              Publicar Nova Vaga
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Nenhuma vaga publicada ainda
            </h3>
            <p className="text-slate-500 mb-6">
              Comece publicando sua primeira vaga para encontrar freelancers talentosos.
            </p>
            <Link href="/empresa/publicar-projeto">
              <Button className="button-gradient">
                <PlusCircle className="w-4 h-4 mr-2" />
                Publicar Primeira Vaga
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-slate-800 line-clamp-2">
                    {project.title}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                
                <p className="text-slate-600 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="font-semibold">
                        R$ {project.budget.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {project._count.proposals} propostas
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-slate-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-500">
                    <p>Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100">
                    <Link href={`/vagas/${project.id}`}>
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
} 