'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  MessageCircle, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import ContractProgressView from './ContractProgressView';
import RealTimeChat from './RealTimeChat';
import ContractAnalyticsDashboard from './ContractAnalyticsDashboard';
import DisputeResolution from './DisputeResolution';

interface Contract {
  id: string;
  status: string;
  totalAmount: number;
  startDate: string;
  deadline: string;
  project: {
    id: string;
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
  milestones: Array<{
    id: string;
    title: string;
    status: string;
    amount: number;
    dueDate: string;
  }>;
  _count: {
    messages: number;
  };
}

interface IntegratedContractDashboardProps {
  contractId?: string;
  mode?: 'single' | 'overview';
}

export default function IntegratedContractDashboard({ 
  contractId, 
  mode = 'single' 
}: IntegratedContractDashboardProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'analytics' | 'disputes'>('progress');
  const [contract, setContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(contractId || null);
  const [loading, setLoading] = useState(true);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (mode === 'single' && contractId) {
      loadContract(contractId);
    } else {
      loadContracts();
    }
  }, [contractId, mode]);

  useEffect(() => {
    if (selectedContract) {
      loadContract(selectedContract);
    }
  }, [selectedContract]);

  const loadContract = async (id: string) => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/contracts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar contrato');
      }

      const data = await response.json();
      setContract(data);
    } catch (error) {
      console.error('Erro ao carregar contrato:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch('/api/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar contratos');
      }

      const data = await response.json();
      setContracts(data);
      if (data.length > 0 && !selectedContract) {
        setSelectedContract(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'progress' as const,
      label: 'Progresso',
      icon: BarChart3,
      description: 'Acompanhe marcos e timeline'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Estatísticas e métricas'
    },
    {
      id: 'disputes' as const,
      label: 'Disputas',
      icon: AlertTriangle,
      description: 'Resolução de conflitos'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {mode === 'single' ? 'Dashboard do Contrato' : 'Gestão de Contratos'}
              </h1>
              
              {mode === 'overview' && (
                <select
                  value={selectedContract || ''}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Selecione um contrato</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.project.title} - {c.company.companyName || c.company.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-4">
              {contract && (
                <button
                  onClick={() => {
                    setShowChat(true);
                    setChatMinimized(false);
                  }}
                  className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                  {contract._count.messages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {contract._count.messages > 9 ? '9+' : contract._count.messages}
                    </span>
                  )}
                </button>
              )}
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedContract ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum contrato selecionado</h3>
              <p>Selecione um contrato para visualizar o dashboard</p>
            </div>
          </div>
        ) : (
          <>
            {/* Contract Info Bar */}
            {contract && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {contract.project.title}
                    </h2>
                    <p className="text-gray-600">
                      {user?.uid === contract.freelancer.id ? 
                        `Cliente: ${contract.company.companyName || contract.company.name}` :
                        `Freelancer: ${contract.freelancer.name}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {contract.totalAmount.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Prazo: {new Date(contract.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'progress' && selectedContract && (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ContractProgressView contractId={selectedContract} />
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ContractAnalyticsDashboard 
                        userType={user?.userType as 'freelancer' | 'company' || 'freelancer'} 
                      />
                    </motion.div>
                  )}

                  {activeTab === 'disputes' && selectedContract && contract && (
                    <motion.div
                      key="disputes"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DisputeResolution 
                        contractId={selectedContract}
                        contractData={{
                          project: contract.project,
                          freelancer: contract.freelancer,
                          company: contract.company
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Real-time Chat */}
      {showChat && contract && (
        <RealTimeChat
          contractId={selectedContract!}
          contract={{
            freelancer: contract.freelancer,
            company: contract.company,
            project: contract.project
          }}
          isMinimized={chatMinimized}
          onToggleMinimize={() => setChatMinimized(!chatMinimized)}
        />
      )}

      {/* Quick Stats Sidebar */}
      {mode === 'overview' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Resumo Geral</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Contratos Ativos:</span>
              <span className="font-semibold">{contracts.filter(c => c.status === 'ACTIVE').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total em Andamento:</span>
              <span className="font-semibold">
                R$ {contracts
                  .filter(c => c.status === 'ACTIVE')
                  .reduce((sum, c) => sum + c.totalAmount, 0)
                  .toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Marcos Pendentes:</span>
              <span className="font-semibold">
                {contracts.reduce((sum, c) => 
                  sum + c.milestones.filter(m => ['PENDING', 'IN_PROGRESS'].includes(m.status)).length, 0
                )}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 