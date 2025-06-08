import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';

interface Proposal {
  id: string;
  value: number;
  description: string;
  deliveryTime: number;
  status: string;
  coverLetter: string;
  availability: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    hourlyRate?: number;
    yearsOfExperience?: number;
    skills: string[];
  };
  job: {
    id: string;
    title: string;
    budget: number;
  };
}

export function useProposals(jobId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar propostas
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals', jobId],
    queryFn: async () => {
      const url = jobId
        ? `/api/jobs/${jobId}/proposals`
        : '/api/proposals/my-proposals';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar propostas');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Criar proposta
  const createProposal = useMutation({
    mutationFn: async (data: {
      jobId: string;
      value: number;
      deliveryTime: number;
      coverLetter: string;
      availability: string;
    }) => {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar proposta');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });

  // Atualizar status da proposta
  const updateProposalStatus = useMutation({
    mutationFn: async ({
      proposalId,
      status,
    }: {
      proposalId: string;
      status: string;
    }) => {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da proposta');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });

  // Retirar proposta
  const withdrawProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao retirar proposta');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });

  return {
    proposals,
    isLoading,
    createProposal: createProposal.mutate,
    updateProposalStatus: updateProposalStatus.mutate,
    withdrawProposal: withdrawProposal.mutate,
  };
}