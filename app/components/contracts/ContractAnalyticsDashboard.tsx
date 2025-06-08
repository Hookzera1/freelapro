'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalRevenue: number;
  averageContractValue: number;
  averageCompletionTime: number;
  successRate: number;
  milestoneStats: {
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    avgMilestoneValue: number;
  };
  monthlyData: Array<{
    month: string;
    contracts: number;
    revenue: number;
    completionRate: number;
  }>;
  performanceMetrics: {
    onTimeDelivery: number;
    clientSatisfaction: number;
    paymentSpeed: number;
    communicationRating: number;
  };
  topProjects: Array<{
    id: string;
    title: string;
    value: number;
    progress: number;
    client: string;
  }>;
}

interface ContractAnalyticsDashboardProps {
  userType: 'freelancer' | 'company';
}

export default function ContractAnalyticsDashboard({ userType }: ContractAnalyticsDashboardProps) {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/analytics/contracts?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar analytics');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      // Dados mock para demonstração
      setStats({
        totalContracts: 24,
        activeContracts: 8,
        completedContracts: 16,
        totalRevenue: 156750,
        averageContractValue: 6531.25,
        averageCompletionTime: 18.5,
        successRate: 94.2,
        milestoneStats: {
          totalMilestones: 89,
          completedMilestones: 67,
          overdueMilestones: 3,
          avgMilestoneValue: 2177.08
        },
        monthlyData: [
          { month: 'Jan', contracts: 4, revenue: 28500, completionRate: 92 },
          { month: 'Fev', contracts: 6, revenue: 35200, completionRate: 95 },
          { month: 'Mar', contracts: 5, revenue: 31800, completionRate: 88 },
          { month: 'Abr', contracts: 7, revenue: 42300, completionRate: 97 },
          { month: 'Mai', contracts: 2, revenue: 18950, completionRate: 100 }
        ],
        performanceMetrics: {
          onTimeDelivery: 88.5,
          clientSatisfaction: 4.7,
          paymentSpeed: 92.3,
          communicationRating: 4.8
        },
        topProjects: [
          { id: '1', title: 'E-commerce Platform', value: 25000, progress: 85, client: 'TechCorp' },
          { id: '2', title: 'Mobile App Development', value: 18500, progress: 95, client: 'StartupXYZ' },
          { id: '3', title: 'Website Redesign', value: 12000, progress: 100, client: 'DesignStudio' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number, threshold: number = 80) => {
    if (value >= threshold) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value >= threshold * 0.7) return <Activity className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Erro ao carregar dados de analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics de Contratos
          </h2>
          <p className="text-gray-600">
            Análise detalhada do desempenho {userType === 'freelancer' ? 'como freelancer' : 'da empresa'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 dias' : 
               range === '30d' ? '30 dias' : 
               range === '90d' ? '90 dias' : '1 ano'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.totalContracts}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mt-2">Total de Contratos</h3>
          <p className="text-sm text-gray-600">
            {stats.activeContracts} ativos, {stats.completedContracts} concluídos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              R$ {stats.totalRevenue.toLocaleString('pt-BR')}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mt-2">Receita Total</h3>
          <p className="text-sm text-gray-600">
            Média: R$ {stats.averageContractValue.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {stats.averageCompletionTime}d
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mt-2">Tempo Médio</h3>
          <p className="text-sm text-gray-600">
            Para conclusão de projetos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">
              {stats.successRate}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mt-2">Taxa de Sucesso</h3>
          <p className="text-sm text-gray-600">
            Contratos concluídos com sucesso
          </p>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getPerformanceIcon(stats.performanceMetrics.onTimeDelivery)}
              <span className={`text-2xl font-bold ${getPerformanceColor(stats.performanceMetrics.onTimeDelivery)}`}>
                {stats.performanceMetrics.onTimeDelivery}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Entregas no Prazo</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {stats.performanceMetrics.clientSatisfaction}/5
              </span>
            </div>
            <p className="text-sm text-gray-600">Satisfação do Cliente</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getPerformanceIcon(stats.performanceMetrics.paymentSpeed)}
              <span className={`text-2xl font-bold ${getPerformanceColor(stats.performanceMetrics.paymentSpeed)}`}>
                {stats.performanceMetrics.paymentSpeed}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Velocidade de Pagamento</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {stats.performanceMetrics.communicationRating}/5
              </span>
            </div>
            <p className="text-sm text-gray-600">Comunicação</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas de Marcos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estatísticas de Marcos
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total de Marcos</span>
              <span className="font-semibold">{stats.milestoneStats.totalMilestones}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Marcos Concluídos</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">
                  {stats.milestoneStats.completedMilestones}
                </span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Marcos Atrasados</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-600">
                  {stats.milestoneStats.overdueMilestones}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Valor Médio por Marco</span>
              <span className="font-semibold">
                R$ {stats.milestoneStats.avgMilestoneValue.toLocaleString('pt-BR')}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso dos Marcos</span>
                <span>{Math.round((stats.milestoneStats.completedMilestones / stats.milestoneStats.totalMilestones) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${(stats.milestoneStats.completedMilestones / stats.milestoneStats.totalMilestones) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {userType === 'freelancer' ? 'Principais Projetos' : 'Contratos de Maior Valor'}
          </h3>
          <div className="space-y-4">
            {stats.topProjects.map((project, index) => (
              <div key={project.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>
                  </div>
                  <div className="ml-11 mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>R$ {project.value.toLocaleString('pt-BR')}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Mensal
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {stats.monthlyData.map((month, index) => (
            <div key={month.month} className="text-center">
              <div className="bg-blue-50 p-4 rounded-lg mb-2">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {month.contracts}
                </div>
                <div className="text-xs text-gray-600">Contratos</div>
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {month.month}
              </div>
              <div className="text-xs text-gray-600">
                R$ {(month.revenue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-green-600">
                {month.completionRate}% conclusão
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 