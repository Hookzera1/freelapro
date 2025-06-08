'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Proposal {
  id: string;
  value: number;
  description: string;
  deliveryTime: number;
  availability: string;
  coverLetter: string;
  status: string;
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

export default function Candidates() {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!user || user.userType !== 'company') {
      router.push('/login');
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs/my-jobs');
        if (!response.ok) throw new Error('Erro ao carregar vagas');
        const data = await response.json();
        setJobs(data);
        if (data.length > 0) setSelectedJobId(data[0].id);
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
      }
    };

    fetchJobs();
  }, [user, router]);

  useEffect(() => {
    if (!selectedJobId) return;

    const fetchProposals = async () => {
      try {
        const response = await fetch(`/api/jobs/${selectedJobId}/proposals`);
        if (!response.ok) throw new Error('Erro ao carregar propostas');
        const data = await response.json();
        setProposals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar propostas');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [selectedJobId]);

  const handleStatusChange = async (proposalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      setProposals(proposals.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, status: newStatus }
          : proposal
      ));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container-custom">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Candidatos
            </h1>
            <Link href="/criar-vaga" className="btn-primary">
              Criar Nova Vaga
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Seletor de Vagas */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selecione a Vaga
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="input-field w-full md:w-1/2"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-slate-600 mb-4">
                Nenhuma proposta recebida ainda
              </h2>
              <p className="text-slate-500">
                Aguarde candidatos se inscreverem na sua vaga.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {proposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    {/* Informações do Freelancer */}
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-4">
                        {proposal.user.image ? (
                          <Image
                            src={proposal.user.image}
                            alt={proposal.user.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-600">
                              {proposal.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-slate-800">
                            {proposal.user.name}
                          </h3>
                          <div className="text-sm text-slate-500">
                            {proposal.user.yearsOfExperience
                              ? `${proposal.user.yearsOfExperience} anos de experiência`
                              : 'Experiência não informada'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {proposal.user.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="prose max-w-none text-slate-600">
                        <p>{proposal.coverLetter}</p>
                      </div>
                    </div>

                    {/* Detalhes da Proposta */}
                    <div className="flex flex-col items-end space-y-4 min-w-[200px]">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          R$ {proposal.value.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-slate-500">
                          {proposal.deliveryTime} dias para entrega
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 w-full">
                        {proposal.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(proposal.id, 'ACCEPTED')}
                              className="btn-primary w-full"
                            >
                              Aceitar Proposta
                            </button>
                            <button
                              onClick={() => handleStatusChange(proposal.id, 'REJECTED')}
                              className="btn-secondary w-full"
                            >
                              Recusar
                            </button>
                          </>
                        )}
                        {proposal.status === 'ACCEPTED' && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm text-center">
                            Proposta Aceita
                          </span>
                        )}
                        {proposal.status === 'REJECTED' && (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm text-center">
                            Proposta Recusada
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/perfil/${proposal.user.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver Perfil Completo
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}