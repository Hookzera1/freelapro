'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface ProjectForm {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  type: string;
  duration: string;
  experience: string;
  skills: string[];
  location: string;
}

export default function CreateProject() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ProjectForm>({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    type: 'fixed-price',
    duration: 'not-specified',
    experience: 'any',
    skills: [],
    location: ''
  });

  if (!user || user.userType !== 'company') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetchWithAuth('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar projeto');
      }

      const data = await response.json();
      router.push(`/meus-projetos`);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      // Adicionar notificação de erro aqui
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setForm(prev => ({ ...prev, skills }));
  };

  return (
    <main className="container-custom py-8">
      <Card className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Criar Novo Projeto</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Título do Projeto
            </label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Desenvolvimento de Website E-commerce"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva os detalhes do projeto..."
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">
                Orçamento (R$)
              </label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={form.budget}
                onChange={handleChange}
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1">
                Prazo Final
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <Select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="web">Desenvolvimento Web</option>
                <option value="mobile">Desenvolvimento Mobile</option>
                <option value="desktop">Desenvolvimento Desktop</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing Digital</option>
                <option value="writing">Redação e Tradução</option>
                <option value="other">Outro</option>
              </Select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Projeto
              </label>
              <Select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="fixed-price">Preço Fixo</option>
                <option value="hourly">Por Hora</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">
                Duração Estimada
              </label>
              <Select
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
              >
                <option value="not-specified">Não Especificado</option>
                <option value="less-than-1-month">Menos de 1 mês</option>
                <option value="1-3-months">1-3 meses</option>
                <option value="3-6-months">3-6 meses</option>
                <option value="more-than-6-months">Mais de 6 meses</option>
              </Select>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-1">
                Nível de Experiência
              </label>
              <Select
                id="experience"
                name="experience"
                value={form.experience}
                onChange={handleChange}
              >
                <option value="any">Qualquer Nível</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="expert">Especialista</option>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">
              Habilidades Necessárias
            </label>
            <Input
              id="skills"
              name="skills"
              value={form.skills.join(', ')}
              onChange={handleSkillsChange}
              placeholder="Ex: React, Node.js, TypeScript (separadas por vírgula)"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
              Localização (opcional)
            </label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Ex: Remoto, São Paulo - SP"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="button-gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
} 