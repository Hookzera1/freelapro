import { useState } from 'react';

interface Proposal {
  id: string;
  userId: string;
  jobId: string;
  coverLetter: string;
  price: number;
  deliveryTime: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

export function useJobProposals(id: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${id}/proposals`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar propostas');
      }

      setProposals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposal: {
    coverLetter: string;
    price: number;
    deliveryTime: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${id}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposal),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar proposta');
      }

      setProposals((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar proposta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    proposals,
    loading,
    error,
    fetchProposals,
    createProposal,
  };
} 