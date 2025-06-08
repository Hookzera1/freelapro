'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Briefcase, Building2, Users, Calendar, DollarSign, Code, FileText, Target, AlertCircle } from 'lucide-react';
import { RouteGuard } from '@/app/components/RouteGuard';

interface FormData {
  title: string;
  description: string;
  scope: string;
  deadline: string;
  budget: string;
  technologies: string;
  type: 'fixed' | 'hourly' | 'recurring';
  level: 'beginner' | 'intermediate' | 'expert';
}

interface FormErrors {
  title?: string;
  description?: string;
  scope?: string;
  deadline?: string;
  budget?: string;
  technologies?: string;
}

export default function PublicarProjetoPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    scope: '',
    deadline: '',
    budget: '',
    technologies: '',
    type: 'fixed',
    level: 'intermediate'
  });

  useEffect(() => {
    console.log('PublicarProjeto - Estado atual:', {
      userPresent: !!user,
      userType: user?.userType,
      loading,
      isSubmitting
    });
  }, [user, loading, isSubmitting]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
      isValid = false;
    }

    if (!formData.scope.trim()) {
      newErrors.scope = 'O escopo é obrigatório';
      isValid = false;
    }

    if (!formData.deadline) {
      newErrors.deadline = 'O prazo é obrigatório';
      isValid = false;
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'O orçamento é obrigatório';
      isValid = false;
    }

    if (!formData.technologies.trim()) {
      newErrors.technologies = 'As tecnologias são obrigatórias';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PublicarProjeto - Iniciando submissão do formulário');

    if (!validateForm()) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('PublicarProjeto - Token não encontrado');
        showToast('Sessão expirada. Por favor, faça login novamente.', 'error');
        router.push('/login');
        return;
      }

      // Verificar tipo de usuário
      if (!user) {
        console.log('PublicarProjeto - Usuário não encontrado');
        showToast('Sessão expirada. Por favor, faça login novamente.', 'error');
        router.push('/login');
        return;
      }

      console.log('PublicarProjeto - Verificando tipo de usuário:', {
        userType: user.userType,
        isCompany: user.userType === 'company'
      });

      if (user.userType !== 'company') {
        console.log('PublicarProjeto - Usuário não é empresa');
        showToast('Apenas empresas podem publicar projetos', 'error');
        router.push('/login');
        return;
      }

      console.log('PublicarProjeto - Enviando projeto para API');
      const budgetValue = parseFloat(formData.budget.replace(/[^0-9,]/g, '').replace(',', '.'));

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          budget: budgetValue,
          deadline: new Date(formData.deadline).toISOString(),
          scope: formData.scope.trim(),
          technologies: formData.technologies.trim(),
          type: formData.type,
          level: formData.level,
          status: 'OPEN'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        console.log('PublicarProjeto - Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        if (response.status === 401) {
          showToast('Sessão expirada. Por favor, faça login novamente.', 'error');
          router.push('/login');
          return;
        }

        if (response.status === 403) {
          showToast('Apenas empresas podem publicar projetos', 'error');
          router.push('/login');
          return;
        }

        throw new Error(data.error || 'Erro ao publicar projeto');
      }

      console.log('PublicarProjeto - Projeto publicado com sucesso');
      showToast('Projeto publicado com sucesso!', 'success');
      router.push('/empresa/minhas-vagas');
    } catch (error) {
      console.error('PublicarProjeto - Erro ao publicar projeto:', error);
      showToast(error instanceof Error ? error.message : 'Erro ao publicar projeto. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      value = (parseInt(value) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    }
    setFormData(prev => ({ ...prev, budget: value }));
    if (errors.budget) {
      setErrors(prev => ({ ...prev, budget: undefined }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof FormData
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <RouteGuard
      allowedUserTypes={['company']}
      requireAuth={true}
      requireVerified={true}
      redirectTo="/login"
      customDeniedMessage="Esta página é exclusiva para empresas"
      customDeniedSuggestion="Se você é uma empresa, faça login com sua conta empresarial para publicar projetos."
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
          <Briefcase className="w-8 h-8 mr-3 text-blue-500" />
          Publicar Novo Projeto
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Título do Projeto
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange(e, 'title')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  } focus:border-transparent transition-all`}
                  placeholder="Ex: Desenvolvimento de E-commerce"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Descrição do Projeto
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, 'description')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  } focus:border-transparent transition-all h-32`}
                  placeholder="Descreva detalhadamente o projeto, seus objetivos e expectativas..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="scope" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Escopo do Projeto
                </label>
                <textarea
                  id="scope"
                  name="scope"
                  value={formData.scope}
                  onChange={(e) => handleInputChange(e, 'scope')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.scope ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  } focus:border-transparent transition-all h-24`}
                  placeholder="Liste as principais entregas, funcionalidades e requisitos do projeto..."
                />
                {errors.scope && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.scope}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="technologies" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Code className="w-4 h-4 mr-2 text-blue-500" />
                  Tecnologias Necessárias
                </label>
                <textarea
                  id="technologies"
                  name="technologies"
                  value={formData.technologies}
                  onChange={(e) => handleInputChange(e, 'technologies')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.technologies ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  } focus:border-transparent transition-all h-24`}
                  placeholder="Liste as tecnologias, frameworks e ferramentas necessárias..."
                />
                {errors.technologies && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.technologies}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Prazo Estimado
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange(e, 'deadline')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  } focus:border-transparent transition-all`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.deadline}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                  Orçamento
                </label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleCurrencyInput}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.budget ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  } focus:border-transparent transition-all`}
                  placeholder="R$ 0,00"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.budget}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Contratação
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange(e, 'type')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="fixed">Preço Fixo</option>
                  <option value="hourly">Por Hora</option>
                  <option value="recurring">Recorrente</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-2">
                  Nível de Experiência
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={(e) => handleInputChange(e, 'level')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="expert">Especialista</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Publicando...
                  </>
                ) : (
                  'Publicar Projeto'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
} 