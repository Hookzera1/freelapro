'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

interface ContractProgress {
  contract: {
    id: string;
    status: string;
    totalAmount: number;
    startDate: string;
    deadline: string;
    project: {
      title: string;
      status: string;
    };
    freelancer: {
      id: string;
      name: string;
      email: string;
    };
    company: {
      id: string;
      name: string;
      companyName?: string;
      email: string;
    };
  };
  progress: {
    overall: number;
    payment: number;
    time: number;
  };
  milestones: {
    total: number;
    completed: number;
    approved: number;
    paid: number;
    overdue: number;
    upcoming: number;
    summary: Array<{
      id: string;
      title: string;
      status: string;
      amount: number;
      dueDate: string;
      isOverdue: boolean;
      isUpcoming: boolean;
      completedAt?: string;
      approvedAt?: string;
      paidAt?: string;
    }>;
  };
  financial: {
    totalValue: number;
    completedValue: number;
    paidValue: number;
    pendingValue: number;
    paymentProgress: number;
  };
  timeline: {
    contractDuration: number;
    daysElapsed: number;
    daysRemaining: number;
    isOverdue: boolean;
    progressVsTime: number;
  };
  alerts: {
    overdueMilestones: Array<{
      id: string;
      title: string;
      dueDate: string;
      daysOverdue: number;
    }>;
    upcomingMilestones: Array<{
      id: string;
      title: string;
      dueDate: string;
      daysUntilDue: number;
    }>;
  };
}

interface ContractProgressViewProps {
  contractId: string;
  onClose?: () => void;
}

export default function ContractProgressView({ contractId, onClose }: ContractProgressViewProps) {
  const [progressData, setProgressData] = useState<ContractProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProgressData();
  }, [contractId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/contracts/${contractId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados de progresso');
      }

      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      setError('Erro ao carregar dados de progresso');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-purple-100 text-purple-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'PAID': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'IN_PROGRESS': return 'Em Progresso';
      case 'COMPLETED': return 'Concluído';
      case 'APPROVED': return 'Aprovado';
      case 'PAID': return 'Pago';
      default: return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Dados não encontrados'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {progressData.contract.project.title}
          </h2>
          <p className="text-gray-600">
            Contrato com {progressData.contract.company.companyName || progressData.contract.company.name}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progresso Geral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {progressData.progress.overall}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">Progresso Geral</h3>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(progressData.progress.overall)}`}
              style={{ width: `${progressData.progress.overall}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Progresso de Pagamentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {progressData.progress.payment}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">Pagamentos</h3>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${progressData.progress.payment}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Tempo Decorrido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {progressData.progress.time}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">Tempo</h3>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-purple-500"
              style={{ width: `${progressData.progress.time}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Marcos Concluídos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">
              {progressData.milestones.completed}/{progressData.milestones.total}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">Marcos</h3>
          <p className="text-sm text-gray-600">
            {progressData.milestones.paid} pagos
          </p>
        </motion.div>
      </div>

      {/* Alertas */}
      {(progressData.alerts.overdueMilestones.length > 0 || progressData.alerts.upcomingMilestones.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas
          </h3>
          
          <div className="space-y-4">
            {/* Marcos Atrasados */}
            {progressData.alerts.overdueMilestones.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Marcos Atrasados</h4>
                <div className="space-y-2">
                  {progressData.alerts.overdueMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-900">{milestone.title}</span>
                      <span className="text-sm text-red-600">
                        {milestone.daysOverdue} dia{milestone.daysOverdue !== 1 ? 's' : ''} de atraso
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marcos Próximos */}
            {progressData.alerts.upcomingMilestones.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Próximos Prazos</h4>
                <div className="space-y-2">
                  {progressData.alerts.upcomingMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium text-yellow-900">{milestone.title}</span>
                      <span className="text-sm text-yellow-600">
                        {milestone.daysUntilDue} dia{milestone.daysUntilDue !== 1 ? 's' : ''} restante{milestone.daysUntilDue !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Dados Financeiros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Análise Financeira
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-xl font-bold text-gray-900">
              R$ {progressData.financial.totalValue.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Concluído</p>
            <p className="text-xl font-bold text-blue-600">
              R$ {progressData.financial.completedValue.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Pago</p>
            <p className="text-xl font-bold text-green-600">
              R$ {progressData.financial.paidValue.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pendente</p>
            <p className="text-xl font-bold text-red-600">
              R$ {progressData.financial.pendingValue.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Timeline dos Marcos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Timeline dos Marcos
        </h3>
        
        <div className="space-y-4">
          {progressData.milestones.summary.map((milestone, index) => (
            <div key={milestone.id} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className={`w-4 h-4 rounded-full ${
                  milestone.status === 'PAID' ? 'bg-green-500' :
                  milestone.status === 'APPROVED' ? 'bg-blue-500' :
                  milestone.status === 'COMPLETED' ? 'bg-purple-500' :
                  milestone.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                  'bg-gray-300'
                }`}></div>
                {index < progressData.milestones.summary.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 ml-2 mt-1"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                    {getStatusText(milestone.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>R$ {milestone.amount.toLocaleString('pt-BR')}</span>
                  <span>Prazo: {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}</span>
                  {milestone.isOverdue && (
                    <span className="text-red-600 font-medium">Atrasado</span>
                  )}
                  {milestone.isUpcoming && (
                    <span className="text-yellow-600 font-medium">Próximo</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 