import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  deadline: string;
  status: string;
  category: string;
  type: string;
  duration: string;
  experience: string;
  location?: string;
  visibility: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    companyName?: string;
  };
  _count: {
    proposals: number;
  };
}

interface JobFilters {
  category?: string;
  type?: string;
  experience?: string;
  duration?: string;
}

export function useJobs(filters?: JobFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar vagas
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (user?.userType === 'company') {
        params.append('userType', 'company');
        params.append('userId', user.id);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar vagas');
      }
      return response.json();
    },
  });

  // Criar vaga
  const createJob = useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'user' | '_count' | 'createdAt'>) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar vaga');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // Atualizar vaga
  const updateJob = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Job>;
    }) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar vaga');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // Deletar vaga
  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar vaga');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    jobs,
    isLoading,
    createJob: createJob.mutate,
    updateJob: updateJob.mutate,
    deleteJob: deleteJob.mutate,
  };
}