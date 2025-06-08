'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, DollarSign, Calendar, FileText, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  company: {
    name: string;
    companyName: string | null;
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EnviarProposta({ params }: PageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const [proposalData, setProposalData] = useState({
    value: '',
    description: '',
    deliveryTime: ''
  });

  useEffect(() => {
    // Verificar se o usuário é freelancer
    if (user && user.userType !== 'freelancer') {
      toast.error('Apenas freelancers podem enviar propostas');
      router.push('/vagas');
      return;
    }

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
  }, [id, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para enviar uma proposta');
      return;
    }

    if (!proposalData.value || !proposalData.description || !proposalData.deliveryTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const value = parseFloat(proposalData.value);
    if (isNaN(value) || value <= 0) {
      toast.error('Valor da proposta deve ser um número válido');
      return;
    }

    const deliveryTime = parseInt(proposalData.deliveryTime);
    if (isNaN(deliveryTime) || deliveryTime <= 0) {
      toast.error('Prazo de entrega deve ser um número válido');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: id,
          value: value,
          description: proposalData.description,
          deliveryTime: deliveryTime
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar proposta');
      }

      toast.success('Proposta enviada com sucesso!');
      router.push('/minhas-propostas');
    } catch (error: any) {
      console.error('Erro ao enviar proposta:', error);
      toast.error(error.message || 'Erro ao enviar proposta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProposalData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Login Necessário
          </h1>
          <p className="text-slate-600 mb-6">
            Você precisa estar logado como freelancer para enviar uma proposta.
          </p>
          <Link href="/login">
            <Button>
              Fazer Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-600 mb-6">
        <Link href="/vagas" className="hover:text-blue-600">
          Vagas
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/vagas/${id}`} className="hover:text-blue-600">
          {project.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Enviar Proposta</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Enviar Proposta
        </h1>
        <p className="text-slate-600">
          Para o projeto: <span className="font-medium">{project.title}</span>
        </p>
        <p className="text-sm text-slate-500">
          Por: {project.company.companyName || project.company.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Detalhes da Proposta</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor da Proposta *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="value"
                    value={proposalData.value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="pl-10 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Informe o valor em reais (R$)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prazo de Entrega *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="deliveryTime"
                    value={proposalData.deliveryTime}
                    onChange={handleChange}
                    min="1"
                    required
                    className="pl-10 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="7"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Número de dias para conclusão do projeto
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição da Proposta *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <textarea
                    name="description"
                    value={proposalData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="pl-10 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descreva sua abordagem para o projeto, experiência relevante e por que você é o freelancer ideal para este trabalho..."
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mínimo de 50 caracteres
                </p>
              </div>

              <div className="flex gap-4">
                <Link href={`/vagas/${id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 button-gradient"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Proposta
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar - Resumo do Projeto */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo do Projeto</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900">{project.title}</h4>
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Orçamento:</span>
                <span className="font-semibold text-green-600">
                  R$ {project.budget.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Prazo:</span>
                <span className="font-medium">
                  {new Date(project.deadline).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Empresa: {project.company.companyName || project.company.name}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 