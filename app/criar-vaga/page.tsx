'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useFetchAuth } from '@/hooks/useFetchAuth';

export default function CriarVaga() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchAuth } = useFetchAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skills: '',
    deadline: '',
    category: 'other',
    type: 'fixed-price',
    duration: 'not-specified',
    experience: 'any',
    location: '',
    visibility: 'PUBLIC',
  });

  // Redirecionar se não estiver autenticado ou não for empresa
  if (!isAuthenticated || !user || user.userType !== 'company') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetchAuth('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
          skills: formData.skills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar vaga');
      }

      router.push('/vagas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao criar a vaga. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Criar Nova Vaga
          </h1>
          <p className="text-slate-600 mb-8">
            Preencha os detalhes da vaga para encontrar o freelancer ideal
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Título da Vaga
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: Desenvolvimento de Website E-commerce"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="development">Desenvolvimento</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Escrita</option>
                <option value="translation">Tradução</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Contratação
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="fixed-price">Preço Fixo</option>
                <option value="hourly">Por Hora</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[150px]"
                placeholder="Descreva os detalhes do projeto, requisitos e expectativas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Orçamento (R$)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duração Estimada
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="not-specified">Não Especificado</option>
                <option value="less-than-1-month">Menos de 1 mês</option>
                <option value="1-3-months">1-3 meses</option>
                <option value="3-6-months">3-6 meses</option>
                <option value="more-than-6-months">Mais de 6 meses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Experiência Necessária
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="any">Qualquer Nível</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="expert">Especialista</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Habilidades Necessárias
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: React, Node.js, TypeScript (separadas por vírgula)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Localização (opcional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: Remoto, São Paulo, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prazo Final
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visibilidade
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="PUBLIC">Pública</option>
                <option value="PRIVATE">Privada</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Criando vaga...
                </div>
              ) : (
                'Publicar Vaga'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}