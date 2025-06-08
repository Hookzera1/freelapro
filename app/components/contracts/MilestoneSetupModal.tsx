'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';

interface MilestoneData {
  id?: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  deliverables: string[];
}

interface MilestoneSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (milestones: MilestoneData[]) => void;
  projectTitle: string;
  totalBudget: number;
  projectDeadline: string;
  projectType?: string;
}

const PROJECT_TEMPLATES = {
  'website': {
    name: 'Website/Landing Page',
    milestones: [
      {
        title: 'Design e Prototipação',
        description: 'Criação do design visual e protótipos interativos',
        percentage: 30,
        deliverables: ['Wireframes', 'Design visual', 'Protótipo navegável']
      },
      {
        title: 'Desenvolvimento Frontend',
        description: 'Implementação do frontend responsivo',
        percentage: 50,
        deliverables: ['Páginas desenvolvidas', 'Responsividade', 'Testes de navegadores']
      },
      {
        title: 'Finalização e Deploy',
        description: 'Ajustes finais, otimização e publicação',
        percentage: 20,
        deliverables: ['Site otimizado', 'Deploy realizado', 'Documentação']
      }
    ]
  },
  'app': {
    name: 'Aplicativo Mobile',
    milestones: [
      {
        title: 'Planejamento e UI/UX',
        description: 'Definição da arquitetura e design da interface',
        percentage: 25,
        deliverables: ['Documentação técnica', 'Designs de telas', 'Fluxo de navegação']
      },
      {
        title: 'Desenvolvimento Core',
        description: 'Implementação das funcionalidades principais',
        percentage: 45,
        deliverables: ['Funcionalidades base', 'Integração de APIs', 'Testes unitários']
      },
      {
        title: 'Testes e Polimento',
        description: 'Testes extensivos e ajustes de usabilidade',
        percentage: 20,
        deliverables: ['App testado', 'Correções aplicadas', 'Performance otimizada']
      },
      {
        title: 'Deploy e Lançamento',
        description: 'Publicação nas lojas e documentação final',
        percentage: 10,
        deliverables: ['App nas lojas', 'Documentação final', 'Suporte inicial']
      }
    ]
  },
  'ecommerce': {
    name: 'E-commerce',
    milestones: [
      {
        title: 'Setup e Estrutura',
        description: 'Configuração da plataforma e estrutura básica',
        percentage: 20,
        deliverables: ['Plataforma configurada', 'Estrutura de dados', 'Autenticação']
      },
      {
        title: 'Catálogo e Produtos',
        description: 'Sistema de produtos, categorias e busca',
        percentage: 30,
        deliverables: ['Gestão de produtos', 'Sistema de busca', 'Carrinho de compras']
      },
      {
        title: 'Pagamentos e Checkout',
        description: 'Integração de pagamentos e processo de compra',
        percentage: 30,
        deliverables: ['Gateway de pagamento', 'Processo de checkout', 'Gestão de pedidos']
      },
      {
        title: 'Finalização e Lançamento',
        description: 'Testes, otimização e lançamento da loja',
        percentage: 20,
        deliverables: ['Testes completos', 'Performance otimizada', 'Loja online']
      }
    ]
  },
  'custom': {
    name: 'Personalizado',
    milestones: [
      {
        title: 'Início e Planejamento',
        description: 'Setup inicial e planejamento detalhado',
        percentage: 25,
        deliverables: ['Documento de requisitos', 'Cronograma detalhado', 'Setup do ambiente']
      },
      {
        title: 'Desenvolvimento Principal',
        description: 'Implementação das funcionalidades principais',
        percentage: 50,
        deliverables: ['Funcionalidades implementadas', 'Testes básicos', 'Demonstração']
      },
      {
        title: 'Finalização e Entrega',
        description: 'Ajustes finais e entrega do projeto',
        percentage: 25,
        deliverables: ['Projeto finalizado', 'Documentação técnica', 'Deploy final']
      }
    ]
  }
};

export default function MilestoneSetupModal({
  isOpen,
  onClose,
  onConfirm,
  projectTitle,
  totalBudget,
  projectDeadline,
  projectType = 'custom'
}: MilestoneSetupModalProps) {
  // Verificar se o projectType é uma chave válida dos templates
  const validProjectType = (projectType && projectType in PROJECT_TEMPLATES) 
    ? projectType as keyof typeof PROJECT_TEMPLATES 
    : 'custom';
    
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof PROJECT_TEMPLATES>(validProjectType);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar marcos com base no template
  useEffect(() => {
    if (isOpen) {
      const template = PROJECT_TEMPLATES[selectedTemplate];
      const projectDuration = Math.max(
        Math.ceil((new Date(projectDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        14
      );

      const newMilestones = template.milestones.map((milestone, index) => {
        const cumulativePercentage = template.milestones
          .slice(0, index + 1)
          .reduce((sum, m) => sum + m.percentage, 0) / 100;
        
        const daysFromStart = Math.floor(projectDuration * cumulativePercentage);
        const dueDate = new Date(Date.now() + daysFromStart * 24 * 60 * 60 * 1000);

        return {
          title: milestone.title,
          description: milestone.description,
          amount: Math.round(totalBudget * (milestone.percentage / 100)),
          dueDate: dueDate.toISOString().split('T')[0],
          deliverables: milestone.deliverables
        };
      });

      setMilestones(newMilestones);
    }
  }, [isOpen, selectedTemplate, totalBudget, projectDeadline]);

  const updateMilestone = (index: number, field: keyof MilestoneData, value: any) => {
    const newMilestones = [...milestones];
    if (field === 'deliverables' && typeof value === 'string') {
      newMilestones[index][field] = value.split('\n').filter(item => item.trim());
    } else {
      (newMilestones[index] as any)[field] = value;
    }
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    const lastMilestone = milestones[milestones.length - 1];
    const baseDate = lastMilestone ? 
      new Date(new Date(lastMilestone.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000) : 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    setMilestones([...milestones, {
      title: `Marco ${milestones.length + 1}`,
      description: 'Descrição do marco',
      amount: 0,
      dueDate: baseDate.toISOString().split('T')[0],
      deliverables: ['Entregável a ser definido']
    }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const validateMilestones = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    if (Math.abs(totalAmount - totalBudget) > 1) {
      newErrors.totalAmount = `Soma dos marcos (R$ ${totalAmount.toLocaleString('pt-BR')}) deve ser igual ao orçamento total (R$ ${totalBudget.toLocaleString('pt-BR')})`;
      isValid = false;
    }

    milestones.forEach((milestone, index) => {
      if (!milestone.title.trim()) {
        newErrors[`title_${index}`] = 'Título é obrigatório';
        isValid = false;
      }
      if (milestone.amount <= 0) {
        newErrors[`amount_${index}`] = 'Valor deve ser maior que zero';
        isValid = false;
      }
      if (!milestone.dueDate) {
        newErrors[`dueDate_${index}`] = 'Data de prazo é obrigatória';
        isValid = false;
      }
      if (milestone.deliverables.length === 0 || !milestone.deliverables[0].trim()) {
        newErrors[`deliverables_${index}`] = 'Pelo menos um entregável é obrigatório';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirm = () => {
    if (validateMilestones()) {
      onConfirm(milestones);
      onClose();
    }
  };

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const amountDifference = totalAmount - totalBudget;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Configurar Marcos do Projeto
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {projectTitle} • R$ {totalBudget.toLocaleString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Templates */}
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Templates de Projeto
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(PROJECT_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key as keyof typeof PROJECT_TEMPLATES)}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        selectedTemplate === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {milestones.length}
                    </div>
                    <div className="text-sm text-slate-600">Marcos</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${
                      Math.abs(amountDifference) < 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {totalAmount.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-slate-600">
                      Total {amountDifference !== 0 && (
                        <span className="text-red-500">
                          ({amountDifference > 0 ? '+' : ''}R$ {Math.abs(amountDifference).toLocaleString('pt-BR')})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.ceil((new Date(projectDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-slate-600">Dias</div>
                  </div>
                </div>
                {errors.totalAmount && (
                  <div className="mt-2 text-sm text-red-600 text-center">
                    {errors.totalAmount}
                  </div>
                )}
              </div>

              {/* Marcos */}
              <div className="px-6 py-4 space-y-4">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Marco {index + 1}
                      </h4>
                      {milestones.length > 1 && (
                        <button
                          onClick={() => removeMilestone(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Título */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`title_${index}`] ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Nome do marco"
                        />
                        {errors[`title_${index}`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`title_${index}`]}</p>
                        )}
                      </div>

                      {/* Valor */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Valor (R$)
                        </label>
                        <input
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`amount_${index}`] ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        {errors[`amount_${index}`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`amount_${index}`]}</p>
                        )}
                      </div>

                      {/* Descrição */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="Descrição das atividades deste marco"
                        />
                      </div>

                      {/* Data de Prazo */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Prazo
                        </label>
                        <input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`dueDate_${index}`] ? 'border-red-300' : 'border-slate-300'
                          }`}
                          max={projectDeadline}
                        />
                        {errors[`dueDate_${index}`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`dueDate_${index}`]}</p>
                        )}
                      </div>

                      {/* Entregáveis */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Entregáveis (um por linha)
                        </label>
                        <textarea
                          value={milestone.deliverables.join('\n')}
                          onChange={(e) => updateMilestone(index, 'deliverables', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`deliverables_${index}`] ? 'border-red-300' : 'border-slate-300'
                          }`}
                          rows={3}
                          placeholder="Documento de requisitos&#10;Código fonte&#10;Documentação técnica"
                        />
                        {errors[`deliverables_${index}`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`deliverables_${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Botão Adicionar Marco */}
                <button
                  onClick={addMilestone}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Marco
                </button>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={Math.abs(amountDifference) >= 1}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  Math.abs(amountDifference) >= 1
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Criar Contrato
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 