'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRealtimeChat } from '@/app/hooks/useRealtimeChat';
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Send,
  Paperclip,
  Calendar,
  Target,
  User,
  Building,
  TrendingUp,
  Award,
  Filter,
  Search,
  Plus,
  Eye,
  ExternalLink,
  Timer,
  BarChart3,
  Star,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReviewSystem from '@/app/components/reviews/ReviewSystem';

interface Contract {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
  };
  client: {
    id: string;
    name: string;
    image?: string;
    companyName?: string;
  };
  totalAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  startDate: string;
  deadline: string;
  milestones: Milestone[];
  _count: {
    messages: number;
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'PAID' | 'REVISION_REQUESTED';
  dueDate: string;
  deliverables: string[];
  completedAt?: string;
  approvedAt?: string;
}

export default function ContractsPage() {
  const { user, getAuthToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'contratos' | 'reviews'>('contratos');
  const [activeContractTab, setActiveContractTab] = useState<'overview' | 'milestones' | 'chat' | 'files'>('overview');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Hook do chat em tempo real
  const { 
    messages, 
    loading: chatLoading, 
    error: chatError, 
    sendMessage: sendRealtimeMessage, 
    isConnected 
  } = useRealtimeChat(selectedContractId || '');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadContracts();
  }, [user, router]);

  const loadContracts = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Token não disponível');
      }

      const response = await fetch('/api/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar contratos');
      }

      const contractsData = await response.json();
      setContracts(contractsData);
      
      if (contractsData.length > 0) {
        setSelectedContractId(contractsData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, action: string) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const token = await getAuthToken();
      if (!token) {
        toast.error('Erro de autenticação. Faça login novamente.');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Recarregar contratos para atualizar a interface
      await loadContracts();
      
      // Mostrar mensagem de sucesso específica baseada na ação
      const actionMessages: Record<string, string> = {
        start: 'Marco iniciado com sucesso!',
        complete: 'Marco concluído com sucesso!',
        approve: 'Marco aprovado com sucesso!',
        request_revision: 'Revisão solicitada com sucesso!',
        pay: 'Pagamento processado com sucesso!'
      };
      
      toast.success(actionMessages[action] || 'Marco atualizado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao atualizar marco:', error);
      
      // Tratamento específico de diferentes tipos de erro
      if (error.message.includes('403')) {
        toast.error('Você não tem permissão para realizar esta ação');
      } else if (error.message.includes('404')) {
        toast.error('Marco não encontrado');
      } else if (error.message.includes('400')) {
        toast.error('Ação inválida para o status atual do marco');
      } else {
        toast.error(error.message || 'Erro ao atualizar marco');
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContractId) return;

    try {
      await sendRealtimeMessage(newMessage.trim());
      setNewMessage('');
      toast.success('Mensagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(error.message || 'Erro ao enviar mensagem');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-300';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-purple-100 text-purple-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'PAID': return 'bg-emerald-100 text-emerald-700';
      case 'REVISION_REQUESTED': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMilestoneStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'IN_PROGRESS': return 'Em Progresso';
      case 'COMPLETED': return 'Concluído';
      case 'APPROVED': return 'Aprovado';
      case 'PAID': return 'Pago';
      case 'REVISION_REQUESTED': return 'Revisão Solicitada';
      default: return status;
    }
  };

  // Filtrar contratos
  const filteredContracts = contracts.filter(contract => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && contract.status === 'ACTIVE') ||
      (filter === 'completed' && contract.status === 'COMPLETED');
    
    const matchesSearch = searchTerm === '' || 
      contract.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Estatísticas do dashboard
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    completed: contracts.filter(c => c.status === 'COMPLETED').length,
    totalEarnings: contracts.reduce((sum, c) => sum + c.totalAmount, 0),
    averageProgress: contracts.length > 0 ? 
      Math.round(contracts.reduce((sum, c) => sum + c.progress, 0) / contracts.length) : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
        <div className="container-custom max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
        <div className="container-custom max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Nenhum Contrato Encontrado
            </h1>
            <p className="text-slate-600 mb-6">
              Você ainda não possui contratos ativos. Quando uma proposta for aceita, o contrato aparecerá aqui.
            </p>
            <button
              onClick={() => router.push(user?.userType === 'company' ? '/empresa/dashboard' : '/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard de Contratos
          </h1>
          <p className="text-slate-600">
            Gerencie seus projetos, marcos e comunicação em um só lugar
          </p>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total de Contratos</h3>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-sm text-slate-500 mt-1">
              {stats.active} ativos, {stats.completed} concluídos
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Progresso Médio</h3>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats.averageProgress}%</p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.averageProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Valor Total</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              R$ {stats.totalEarnings.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-slate-500 mt-1">Em todos os contratos</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Próximos Prazos</h3>
              <Timer className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {contracts.flatMap(c => c.milestones)
                .filter(m => m.status === 'IN_PROGRESS' || m.status === 'PENDING')
                .filter(m => new Date(m.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                .length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Próximos 7 dias</p>
          </div>
        </motion.div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ativos ({stats.active})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'completed' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Concluídos ({stats.completed})
              </button>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Navegação por Abas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveMainTab('contratos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeMainTab === 'contratos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contratos Ativos
                </div>
              </button>
              
              <button
                onClick={() => setActiveMainTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeMainTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Avaliações
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeMainTab === 'contratos' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Contratos */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Contratos ({filteredContracts.length})
                </h2>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredContracts.map((contract, index) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedContractId(contract.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedContractId === contract.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">
                          {contract.project.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                          {contract.status === 'ACTIVE' ? 'Ativo' : contract.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 truncate">
                          {contract.client.companyName || contract.client.name}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progresso</span>
                          <span className="font-medium text-slate-800">{contract.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${contract.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                        <span>R$ {contract.totalAmount.toLocaleString('pt-BR')}</span>
                        <span>{contract.milestones.length} marcos</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detalhes do Contrato */}
            {selectedContractId && (
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Contract Details Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Contract tabs">
                      {['overview', 'milestones', 'chat', 'files'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveContractTab(tab as typeof activeContractTab)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeContractTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab === 'overview' ? 'Visão Geral' : 
                           tab === 'milestones' ? 'Marcos' :
                           tab === 'chat' ? 'Chat' : 'Arquivos'}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeContractTab === 'overview' && (
                      <div className="space-y-6">
                        {(() => {
                          const selectedContract = contracts.find(c => c.id === selectedContractId);
                          if (!selectedContract) return <div>Contrato não encontrado</div>;
                          
                          return (
                            <>
                              {/* Header do Contrato */}
                              <div className="border-b border-slate-100 pb-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h2 className="text-2xl font-bold text-slate-800">
                                    {selectedContract.project.title}
                                  </h2>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedContract.status)}`}>
                                      {selectedContract.status === 'ACTIVE' ? 'Ativo' : selectedContract.status}
                                    </span>
                                    <button
                                      onClick={() => router.push(`/projetos/${selectedContract.project.id}`)}
                                      className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                                      title="Ver projeto completo"
                                    >
                                      <ExternalLink className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                  <div className="flex items-center gap-3">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Valor Total</p>
                                      <p className="font-bold text-slate-800">
                                        R$ {selectedContract.totalAmount.toLocaleString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Prazo</p>
                                      <p className="font-bold text-slate-800">
                                        {new Date(selectedContract.deadline).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <Target className="w-6 h-6 text-purple-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Progresso</p>
                                      <p className="font-bold text-slate-800">
                                        {selectedContract.progress}%
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <Building className="w-6 h-6 text-slate-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Cliente</p>
                                      <p className="font-bold text-slate-800">
                                        {selectedContract.client.companyName || selectedContract.client.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Resumo do Projeto */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                  Resumo do Projeto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3">
                                      <DollarSign className="w-8 h-8 text-green-600" />
                                      <div>
                                        <p className="text-sm text-green-600">Valor Recebido</p>
                                        <p className="text-xl font-bold text-green-700">
                                          R$ {(selectedContract.milestones
                                            .filter(m => m.status === 'PAID')
                                            .reduce((sum, m) => sum + m.amount, 0))
                                            .toLocaleString('pt-BR')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                          
                                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                      <Clock className="w-8 h-8 text-blue-600" />
                                      <div>
                                        <p className="text-sm text-blue-600">Marcos Concluídos</p>
                                        <p className="text-xl font-bold text-blue-700">
                                          {selectedContract.milestones.filter(m => ['COMPLETED', 'APPROVED', 'PAID'].includes(m.status)).length} de {selectedContract.milestones.length}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="w-8 h-8 text-purple-600" />
                                      <div>
                                        <p className="text-sm text-purple-600">Dias Restantes</p>
                                        <p className="text-xl font-bold text-purple-700">
                                          {Math.max(0, Math.ceil((new Date(selectedContract.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Descrição do Projeto */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                  Descrição do Projeto
                                </h3>
                                <div className="bg-slate-50 rounded-lg p-4">
                                  <p className="text-slate-700 leading-relaxed">
                                    {selectedContract.project.description}
                                  </p>
                                </div>
                              </div>

                              {/* Tecnologias */}
                              {selectedContract.project.technologies && (() => {
                                let techs: string[] = [];
                                try {
                                  techs = typeof selectedContract.project.technologies === 'string' 
                                    ? JSON.parse(selectedContract.project.technologies) 
                                    : selectedContract.project.technologies;
                                  if (!Array.isArray(techs)) {
                                    techs = [];
                                  }
                                } catch {
                                  techs = [];
                                }
                                
                                return techs.length > 0 && (
                                  <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                      Tecnologias
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {techs.map((tech, index) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    {activeContractTab === 'milestones' && (
                      <div className="space-y-4">
                        {(() => {
                          const selectedContract = contracts.find(c => c.id === selectedContractId);
                          if (!selectedContract) return <div>Contrato não encontrado</div>;
                          
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800">
                                  Marcos do Projeto ({selectedContract.milestones.length})
                                </h3>
                                <div className="text-sm text-slate-600">
                                  {selectedContract.milestones.filter(m => ['COMPLETED', 'APPROVED', 'PAID'].includes(m.status)).length} concluídos
                                </div>
                              </div>
                              
                              {selectedContract.milestones.map((milestone, index) => (
                                <motion.div
                                  key={milestone.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">
                                          {milestone.title}
                                        </h4>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                                          {getMilestoneStatusText(milestone.status)}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 mb-3">
                                        {milestone.description}
                                      </p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <span className="text-slate-500">Valor:</span>
                                          <span className="ml-2 font-medium text-green-600">
                                            R$ {milestone.amount.toLocaleString('pt-BR')}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500">Prazo:</span>
                                          <span className="ml-2 font-medium text-slate-800">
                                            {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500">Entregáveis:</span>
                                          <span className="ml-2 font-medium text-slate-800">
                                            {(() => {
                                              let deliverables: string[] = [];
                                              try {
                                                deliverables = typeof milestone.deliverables === 'string' 
                                                  ? JSON.parse(milestone.deliverables) 
                                                  : milestone.deliverables || [];
                                                if (!Array.isArray(deliverables)) {
                                                  deliverables = [];
                                                }
                                              } catch {
                                                deliverables = [];
                                              }
                                              
                                              return `${deliverables.length} itens`;
                                            })()}
                                          </span>
                                        </div>
                                      </div>

                                      {milestone.deliverables && (() => {
                                        let deliverables: string[] = [];
                                        try {
                                          deliverables = typeof milestone.deliverables === 'string' 
                                            ? JSON.parse(milestone.deliverables) 
                                            : milestone.deliverables;
                                          if (!Array.isArray(deliverables)) {
                                            deliverables = [];
                                          }
                                        } catch {
                                          deliverables = [];
                                        }
                                        
                                        return deliverables.length > 0 && (
                                          <div className="mt-4">
                                            <h5 className="text-sm font-medium text-slate-700 mb-2">Entregáveis:</h5>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                              {deliverables.map((deliverable, idx) => (
                                                <li key={idx}>{deliverable}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    {milestone.status === 'COMPLETED' && user?.userType === 'company' && (
                                      <>
                                        <button 
                                          onClick={() => updateMilestoneStatus(milestone.id, 'approve')}
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          Aprovar e Liberar Pagamento
                                        </button>
                                        <button 
                                          onClick={() => updateMilestoneStatus(milestone.id, 'request_revision')}
                                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                          Solicitar Revisão
                                        </button>
                                      </>
                                    )}
                                    
                                    {milestone.status === 'PENDING' && user?.userType === 'freelancer' && (
                                      <button 
                                        onClick={() => updateMilestoneStatus(milestone.id, 'start')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                      >
                                        <Clock className="w-4 h-4" />
                                        Iniciar Marco
                                      </button>
                                    )}

                                    {milestone.status === 'IN_PROGRESS' && user?.userType === 'freelancer' && (
                                      <button 
                                        onClick={() => updateMilestoneStatus(milestone.id, 'complete')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                      >
                                        <Target className="w-4 h-4" />
                                        Marcar como Concluído
                                      </button>
                                    )}

                                    {milestone.status === 'APPROVED' && user?.userType === 'company' && (
                                      <button 
                                        onClick={() => updateMilestoneStatus(milestone.id, 'pay')}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                      >
                                        <DollarSign className="w-4 h-4" />
                                        Marcar como Pago
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    {activeContractTab === 'chat' && (
                      <div className="h-96 flex flex-col">
                        {/* Indicador de Conexão */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {isConnected ? (
                              <>
                                <Wifi className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-700">Chat conectado em tempo real</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-orange-700">Reconectando...</span>
                              </>
                            )}
                          </div>
                          {chatError && (
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                              {chatError}
                            </span>
                          )}
                        </div>

                        {/* Área de Mensagens */}
                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
                          {chatLoading ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                              <p className="text-slate-500">Carregando mensagens...</p>
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                              <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {messages.map((message) => (
                                <motion.div 
                                  key={message.id} 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex gap-3 ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-xs lg:max-w-md ${message.isOwnMessage ? 'order-2' : 'order-1'}`}>
                                    {!message.isOwnMessage && (
                                      <div className="flex items-center gap-2 mb-1">
                                        {message.senderImage ? (
                                          <img 
                                            src={message.senderImage} 
                                            alt={message.senderName}
                                            className="w-6 h-6 rounded-full"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                            <span className="text-xs text-white font-medium">
                                              {message.senderName.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                        )}
                                        <span className="font-medium text-sm text-slate-800">
                                          {message.senderName}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                    )}
                                    <div className={`rounded-lg p-3 ${
                                      message.isOwnMessage 
                                        ? 'bg-blue-600 text-white ml-auto' 
                                        : 'bg-white border border-slate-200'
                                    }`}>
                                      <p className={`text-sm ${message.isOwnMessage ? 'text-white' : 'text-slate-700'}`}>
                                        {message.content}
                                      </p>
                                    </div>
                                    {message.isOwnMessage && (
                                      <div className="text-right mt-1">
                                        <span className="text-xs text-slate-500">
                                          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Formulário de Envio */}
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            disabled={!isConnected}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || !isConnected}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Enviar
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {activeContractTab === 'files' && (
                      <div className="space-y-6">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                          <h3 className="text-lg font-medium text-slate-800 mb-2">
                            Upload de Arquivos
                          </h3>
                          <p className="text-slate-600 mb-4">
                            Faça upload de documentos, imagens ou outros arquivos relacionados ao projeto
                          </p>
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Selecionar Arquivos
                          </button>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Arquivos do Projeto
                          </h3>
                          <div className="text-center text-slate-500 py-8">
                            <Paperclip className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Nenhum arquivo compartilhado ainda</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba de Reviews */}
        {activeMainTab === 'reviews' && user && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reviews Recebidas */}
              <div>
                <ReviewSystem 
                  userId={user.uid}
                  type="received"
                  showCreateButton={false}
                />
              </div>
              
              {/* Reviews Dadas */}
              <div>
                <ReviewSystem 
                  userId={user.uid}
                  type="given"
                  showCreateButton={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}