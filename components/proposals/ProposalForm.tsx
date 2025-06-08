'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false,
});

interface ProposalFormProps {
  jobId: string;
  jobTitle: string;
  jobBudget: number;
}

export default function ProposalForm({ jobId, jobTitle, jobBudget }: ProposalFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    value: '',
    description: '',
    deliveryTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          value: parseFloat(formData.value),
          description: formData.description,
          deliveryTime: parseInt(formData.deliveryTime),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar proposta');
      }

      router.push('/minhas-propostas');
    } catch (err) {
      setError('Ocorreu um erro ao enviar sua proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="container-custom py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Faça login para enviar uma proposta
          </h2>
          <p className="text-slate-600 mb-6">
            Você precisa estar logado para enviar propostas para projetos.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Enviar Proposta
        </h1>
        <p className="text-slate-600 mb-8">
          Para: {jobTitle}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-2">
              Valor da Proposta (R$)
            </label>
            <div className="relative">
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="input-field pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                R$
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Orçamento do projeto: R$ {jobBudget.toLocaleString('pt-BR')}
            </p>
          </div>

          <div>
            <label htmlFor="deliveryTime" className="block text-sm font-medium text-slate-700 mb-2">
              Prazo de Entrega (em dias)
            </label>
            <input
              type="number"
              id="deliveryTime"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              placeholder="30"
              min="1"
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Descrição da Proposta
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Descreva sua proposta em detalhes..."
              required
              className="input-field"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Proposta'}
            </button>
          </div>
        </form>
      </MotionDiv>
    </div>
  );
} 