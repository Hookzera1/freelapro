'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, User } from 'lucide-react';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Proposal {
  uid: string;
  value: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user: {
    uid: string;
    name: string;
    image: string | null;
  };
  job: {
    uid: string;
    title: string;
  };
}

export default function ReceivedProposals() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.userType !== 'company') {
      router.push('/login');
      return;
    }

    const fetchProposals = async () => {
      try {
        const response = await fetchWithAuth('/api/proposals/received');
        if (!response.ok) throw new Error('Erro ao buscar propostas');
        const data = await response.json();
        setProposals(data);
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [user, router]);

  const handleProposalAction = async (proposalUid: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetchWithAuth(`/api/proposals/${proposalUid}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' })
      });

      if (!response.ok) throw new Error('Erro ao atualizar proposta');

      setProposals(prevProposals =>
        prevProposals.map(proposal =>
          proposal.uid === proposalUid
            ? { ...proposal, status: action === 'accept' ? 'accepted' : 'rejected' }
            : proposal
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
    }
  };

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Pendente
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Aceita
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Recusada
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <main className="container-custom py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Propostas Recebidas</h1>

      {proposals.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Nenhuma proposta recebida ainda
          </h2>
          <p className="text-slate-600 mb-6">
            Quando freelancers enviarem propostas para seus projetos, elas aparecerão aqui.
          </p>
          <Link href="/criar-projeto">
            <Button className="button-gradient">
              Criar Novo Projeto
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {proposals.map((proposal) => (
            <Card key={proposal.uid} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {proposal.user.image ? (
                      <Image
                        src={proposal.user.image}
                        alt={proposal.user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/freelancers/${proposal.user.uid}`}
                      className="text-lg font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      {proposal.user.name}
                    </Link>
                    <p className="text-slate-600 mt-1">
                      Proposta para:{' '}
                      <Link
                        href={`/projetos/${proposal.job.uid}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {proposal.job.title}
                      </Link>
                    </p>
                  </div>
                </div>
                {getStatusBadge(proposal.status)}
              </div>

              <div className="mt-4">
                <p className="text-slate-600">{proposal.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">
                    R$ {proposal.value.toLocaleString('pt-BR')}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Enviada em {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {proposal.status === 'pending' && (
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleProposalAction(proposal.uid, 'reject')}
                    >
                      Recusar
                    </Button>
                    <Button
                      className="button-gradient"
                      onClick={() => handleProposalAction(proposal.uid, 'accept')}
                    >
                      Aceitar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}