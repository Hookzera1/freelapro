'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Job {
  uid: string;
  title: string;
  budget: number;
}

interface Props {
  job: Job;
  onCancel?: () => void;
}

export default function ProposalForm({ job, onCancel }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    deliveryTime: '',
    availability: 'immediate'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${job.uid}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          deliveryTime: parseInt(formData.deliveryTime),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar proposta');
      }

      router.push(`/vagas/${job.uid}?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar proposta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Valor da Proposta (R$)
        </label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleChange}
          className="input-field"
          required
          min="0"
          step="0.01"
          placeholder={`Sugestão: R$ ${job.budget.toLocaleString('pt-BR')}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Prazo de Entrega (dias)
        </label>
        <input
          type="number"
          name="deliveryTime"
          value={formData.deliveryTime}
          onChange={handleChange}
          className="input-field"
          required
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descrição da Proposta
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field min-h-[150px]"
          required
          placeholder="Descreva sua experiência e por que você é a pessoa ideal para este projeto"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Disponibilidade
        </label>
        <select
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="immediate">Imediata</option>
          <option value="one_week">Em uma semana</option>
          <option value="two_weeks">Em duas semanas</option>
          <option value="one_month">Em um mês</option>
        </select>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex-1"
        >
          {submitting ? 'Enviando...' : 'Enviar Proposta'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </motion.form>
  );
} 