'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useFetchAuth } from '@/app/hooks/useFetchAuth';
import { motion } from 'framer-motion';
import { 
  Clock, 
  DollarSign, 
  User, 
  MapPin, 
  Star, 
  CheckCircle, 
  XCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import MilestoneSetupModal from '@/app/components/contracts/MilestoneSetupModal';

interface Proposal {
  id: string;
  message: string;
  budget: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  project?: {
    id: string;
    title: string;
    budget: number;
    deadline: string;
    type?: string;
  };
}

interface MilestoneData {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  deliverables: string[];
}

export default function Propostas() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { fetchAuth } = useFetchAuth();

  useEffect(() => {
    // Só executar loadProposals quando a autenticação estiver carregada
    if (!authLoading) {
      loadProposals();
    }
  }, [authLoading]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await fetchAuth('/api/company/proposals/recent');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposal: Proposal, milestones?: MilestoneData[]) => {
    // Validar se os dados necessários estão presentes
    if (!proposal.project?.id || !proposal.user?.id) {
      toast.error('Dados da proposta incompletos. Tente recarregar a página.');
      return;
    }

    setSelectedProposal(proposal);
    setShowMilestoneModal(true);
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      const response = await fetchAuth(`/api/company/proposals/${proposalId}/reject`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Falha ao recusar proposta');
      
      toast.success('Proposta recusada');
      setProposals(prevProposals =>
        prevProposals.map(p =>
          p.id === proposalId ? { ...p, status: 'REJECTED' } : p
        )
      );
    } catch (error) {
      console.error('Erro ao recusar proposta:', error);
      toast.error('Erro ao recusar proposta');
    }
  };

  const handleMilestonesConfirm = async (milestones: MilestoneData[]) => {
    if (!selectedProposal) return;
    
    // Validar se os dados necessários estão presentes
    if (!selectedProposal.project?.id || !selectedProposal.user?.id) {
      toast.error('Dados da proposta incompletos. Tente recarregar a página.');
      return;
    }
    
    try {
      // Criar contrato com marcos personalizados via API de contratos
      const response = await fetchAuth('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProposal.project.id,
          freelancerId: selectedProposal.user.id,
          companyId: user?.uid,
          totalAmount: selectedProposal.budget,
          deadline: selectedProposal.project.deadline,
          milestones
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar contrato');
      }

      toast.success('Contrato criado com marcos personalizados!');
      
      // Atualizar estado local
      setProposals(prevProposals =>
        prevProposals.map(p =>
          p.id === selectedProposal.id ? { ...p, status: 'ACCEPTED' } : p
        )
      );
      
      setShowMilestoneModal(false);
      setSelectedProposal(null);
      
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar contrato');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Aceita';
      case 'REJECTED': return 'Recusada';
      default: return 'Pendente';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
        <div className="container-custom max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Propostas Recebidas
          </h1>
          <p className="text-slate-600">
            Analise e gerencie as propostas dos freelancers para seus projetos
          </p>
        </motion.div>

        {proposals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Nenhuma Proposta Encontrada
            </h3>
            <p className="text-slate-600">
              Quando freelancers enviarem propostas para seus projetos, elas aparecerão aqui.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {proposal.project?.title || 'Projeto não encontrado'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {proposal.user?.name || 'Usuário não encontrado'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-slate-700 leading-relaxed">
                      {proposal.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <DollarSign className="w-5 h-5" />
                        R$ {proposal.budget?.toLocaleString('pt-BR') || '0'}
                      </div>
                      <div className="text-sm text-slate-500">
                        Orçamento original: R$ {proposal.project?.budget?.toLocaleString('pt-BR') || '0'}
                      </div>
                    </div>

                    {proposal.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRejectProposal(proposal.id)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Recusar
                        </button>
                        <button
                          onClick={() => handleAcceptProposal(proposal)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aceitar e Configurar Marcos
                        </button>
                      </div>
                    )}

                    {proposal.status === 'ACCEPTED' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Proposta Aceita</span>
                      </div>
                    )}

                    {proposal.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Proposta Recusada</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de Configuração de Marcos */}
        {selectedProposal && (
          <MilestoneSetupModal
            isOpen={showMilestoneModal}
            onClose={() => {
              setShowMilestoneModal(false);
              setSelectedProposal(null);
            }}
            onConfirm={handleMilestonesConfirm}
            projectTitle={selectedProposal.project?.title || 'Projeto'}
            totalBudget={selectedProposal.budget || 0}
            projectDeadline={selectedProposal.project?.deadline || new Date().toISOString()}
            projectType={selectedProposal.project?.type || 'custom'}
          />
        )}
      </div>
    </div>
  );
} 