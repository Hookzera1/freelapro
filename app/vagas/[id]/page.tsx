'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, DollarSign, Users, Clock, MapPin, Tag, Building2, Star } from 'lucide-react';
import Link from 'next/link';

interface Project {
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
    image: string | null;
  };
  _count: {
    proposals: number;
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetails({ params }: PageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Buscando projeto:', id);
        const response = await fetch(`/api/projects/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Projeto não encontrado');
          } else {
            setError('Erro ao carregar projeto');
          }
          return;
        }
        
        const data = await response.json();
        console.log('Projeto recebido:', data);
        setProject(data);
      } catch (err) {
        console.error('Erro ao buscar projeto:', err);
        setError('Erro ao carregar projeto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-slate-200 rounded mb-6"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Projeto não encontrado'}
          </h1>
          <p className="text-slate-600 mb-6">
            O projeto que você está procurando não foi encontrado ou não está mais disponível.
          </p>
          <Link href="/vagas">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Vagas
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const canSendProposal = user && user.userType === 'freelancer' && project.status === 'OPEN';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-600 mb-6">
        <Link href="/vagas" className="hover:text-blue-600">
          Vagas
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{project.title}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {project.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              <span>{project.company.companyName || project.company.name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Publicado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
          </div>
        </div>
        
        {canSendProposal && (
          <Link href={`/vagas/${project.id}/enviar-proposta`}>
            <Button className="button-gradient">
              Enviar Proposta
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Descrição do Projeto</h2>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap">{project.description}</p>
            </div>
          </Card>

          {project.scope && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Escopo do Trabalho</h2>
              <p className="text-slate-600 whitespace-pre-wrap">{project.scope}</p>
            </Card>
          )}

          {project.technologies && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tecnologias e Habilidades</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.split(',').map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Projeto */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detalhes do Projeto</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-600">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  <span>Orçamento</span>
                </div>
                <span className="font-semibold text-green-600">
                  R$ {project.budget.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Prazo</span>
                </div>
                <span className="font-medium">
                  {new Date(project.deadline).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-600">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  <span>Tipo</span>
                </div>
                <span className="font-medium">
                  {getTypeText(project.type)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-600">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  <span>Nível</span>
                </div>
                <span className="font-medium">
                  {getLevelText(project.level)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-600">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  <span>Propostas</span>
                </div>
                <span className="font-medium">
                  {project._count.proposals}
                </span>
              </div>
            </div>
          </Card>

          {/* Ações */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ações</h3>
            
            <div className="space-y-3">
              {canSendProposal ? (
                <Link href={`/vagas/${project.id}/enviar-proposta`}>
                  <Button className="w-full button-gradient">
                    Enviar Proposta
                  </Button>
                </Link>
              ) : project.status !== 'OPEN' ? (
                <div className="text-center py-4">
                  <p className="text-slate-600 mb-2">Este projeto não está mais aceitando propostas</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              ) : !user ? (
                <div className="text-center py-4">
                  <p className="text-slate-600 mb-3">
                    Faça login como freelancer para enviar uma proposta
                  </p>
                  <Link href="/login">
                    <Button className="w-full">
                      Fazer Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-600">
                    Apenas freelancers podem enviar propostas
                  </p>
                </div>
              )}
              
              <Link href="/vagas">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Vagas
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 