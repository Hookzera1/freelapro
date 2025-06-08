'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Dispute {
  id: string;
  contractId: string;
  type: 'PAYMENT' | 'QUALITY' | 'DEADLINE' | 'SCOPE' | 'OTHER';
  status: 'OPEN' | 'IN_REVIEW' | 'MEDIATION' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  description: string;
  evidence: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  responses: Array<{
    id: string;
    userId: string;
    userName: string;
    userType: string;
    content: string;
    attachments?: string[];
    createdAt: string;
  }>;
}

interface DisputeResolutionProps {
  contractId: string;
  contractData: {
    project: { title: string };
    freelancer: { id: string; name: string };
    company: { id: string; name: string; companyName?: string };
  };
}

export default function DisputeResolution({ contractId, contractData }: DisputeResolutionProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');
  const { user } = useAuth();

  const [newDispute, setNewDispute] = useState({
    type: 'OTHER' as Dispute['type'],
    priority: 'MEDIUM' as Dispute['priority'],
    title: '',
    description: '',
    evidence: [] as string[]
  });

  useEffect(() => {
    loadDisputes();
  }, [contractId]);

  const loadDisputes = async () => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/contracts/${contractId}/disputes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar disputas');
      }

      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (error) {
      console.error('Erro ao carregar disputas:', error);
      // Dados mock para demonstração
      setDisputes([
        {
          id: '1',
          contractId,
          type: 'PAYMENT',
          status: 'OPEN',
          priority: 'HIGH',
          title: 'Atraso no pagamento do marco 2',
          description: 'O marco 2 foi aprovado há 5 dias, mas o pagamento ainda não foi processado.',
          evidence: [],
          createdBy: contractData.freelancer.id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          responses: [
            {
              id: '1',
              userId: contractData.freelancer.id,
              userName: contractData.freelancer.name,
              userType: 'freelancer',
              content: 'O marco foi entregue e aprovado, mas ainda não recebi o pagamento.',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              userId: contractData.company.id,
              userName: contractData.company.companyName || contractData.company.name,
              userType: 'company',
              content: 'Estamos processando o pagamento. Será liberado em até 2 dias úteis.',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async () => {
    if (!newDispute.title.trim() || !newDispute.description.trim()) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/contracts/${contractId}/disputes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDispute)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar disputa');
      }

      const data = await response.json();
      setDisputes(prev => [data.dispute, ...prev]);
      setNewDispute({
        type: 'OTHER',
        priority: 'MEDIUM',
        title: '',
        description: '',
        evidence: []
      });
      setShowCreateForm(false);
      toast.success('Disputa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar disputa:', error);
      toast.error('Erro ao criar disputa');
    }
  };

  const addResponse = async (disputeId: string) => {
    if (!newResponse.trim()) return;

    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/contracts/${contractId}/disputes/${disputeId}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newResponse.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar resposta');
      }

      const data = await response.json();
      
      // Atualizar a disputa com a nova resposta
      setDisputes(prev => 
        prev.map(dispute => 
          dispute.id === disputeId 
            ? { ...dispute, responses: [...dispute.responses, data.response] }
            : dispute
        )
      );

      if (selectedDispute?.id === disputeId) {
        setSelectedDispute(prev => 
          prev ? { ...prev, responses: [...prev.responses, data.response] } : null
        );
      }

      setNewResponse('');
      toast.success('Resposta enviada!');
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'MEDIATION': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-300';
      case 'ESCALATED': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'URGENT': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: Dispute['type']) => {
    switch (type) {
      case 'PAYMENT': return '💰';
      case 'QUALITY': return '⭐';
      case 'DEADLINE': return '⏰';
      case 'SCOPE': return '📋';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Resolução de Disputas
          </h3>
          <p className="text-gray-600">
            {contractData.project.title}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Abrir Disputa
        </button>
      </div>

      {/* Create Dispute Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-red-200"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Abrir Nova Disputa
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo da Disputa
                  </label>
                  <select
                    value={newDispute.type}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, type: e.target.value as Dispute['type'] }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="PAYMENT">Pagamento</option>
                    <option value="QUALITY">Qualidade</option>
                    <option value="DEADLINE">Prazo</option>
                    <option value="SCOPE">Escopo</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newDispute.priority}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, priority: e.target.value as Dispute['priority'] }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={newDispute.title}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Descreva o problema brevemente"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  value={newDispute.description}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explique o problema em detalhes, incluindo datas e evidências"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={createDispute}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Abrir Disputa
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma disputa aberta
          </h3>
          <p className="text-gray-600">
            Excelente! Não há disputas ativas neste contrato.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <motion.div
              key={dispute.id}
              layout
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDispute(dispute)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(dispute.type)}</span>
                    <h4 className="font-semibold text-gray-900">{dispute.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{dispute.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(dispute.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {dispute.responses.length} resposta{dispute.responses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dispute Detail Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDispute(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(selectedDispute.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedDispute.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDispute.status)}`}>
                          {selectedDispute.status}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(selectedDispute.priority)}`}>
                          Prioridade: {selectedDispute.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDispute(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto max-h-96 p-6">
                {/* Original Description */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Descrição Original</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedDispute.description}
                  </p>
                </div>

                {/* Responses */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Conversação</h4>
                  {selectedDispute.responses.map((response) => {
                    const isOwn = response.userId === user?.uid;
                    return (
                      <div key={response.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-br-sm' 
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">{response.userName}</span>
                            <span className="text-xs opacity-75">
                              {response.userType === 'freelancer' ? 'Freelancer' : 'Empresa'}
                            </span>
                          </div>
                          <p className="text-sm">{response.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(response.createdAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(response.createdAt).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Response Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={2}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    onClick={() => addResponse(selectedDispute.id)}
                    disabled={!newResponse.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      newResponse.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 