'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Github,
  Eye,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Star,
  Filter
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images: string[];
  links: Array<{
    type: string;
    url: string;
    label: string;
  }>;
  category: string;
  featured: boolean;
  completedAt?: string;
  clientName?: string;
  projectValue?: number;
  createdAt: string;
}

interface PortfolioManagerProps {
  userId?: string; // Se não fornecido, usa o usuário atual
  isOwner?: boolean; // Se o usuário pode editar
}

const categories = [
  'web',
  'mobile',
  'design',
  'backend',
  'frontend',
  'fullstack',
  'marketing',
  'consulting',
  'outros'
];

const categoryLabels: Record<string, string> = {
  web: 'Desenvolvimento Web',
  mobile: 'Desenvolvimento Mobile',
  design: 'Design/UI/UX',
  backend: 'Backend',
  frontend: 'Frontend',
  fullstack: 'Full Stack',
  marketing: 'Marketing Digital',
  consulting: 'Consultoria',
  outros: 'Outros'
};

export default function PortfolioManager({ userId, isOwner = true }: PortfolioManagerProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    images: [] as string[],
    links: [] as Array<{ type: string; url: string; label: string }>,
    category: 'web',
    featured: false,
    completedAt: '',
    clientName: '',
    projectValue: 0
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [newLink, setNewLink] = useState({ type: 'demo', url: '', label: '' });

  useEffect(() => {
    loadPortfolio();
  }, [userId, filter]);

  const loadPortfolio = async () => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const targetUserId = userId || user.uid;
      const params = new URLSearchParams({
        userId: targetUserId,
        ...(filter !== 'all' && { category: filter })
      });

      const response = await fetch(`/api/portfolio?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar portfolio');
      }

      const data = await response.json();
      setPortfolioItems(data.items || []);
    } catch (error) {
      console.error('Erro ao carregar portfolio:', error);
      toast.error('Erro ao carregar portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/portfolio/${editingItem.id}` : '/api/portfolio';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar item');
      }

      toast.success(editingItem ? 'Item atualizado!' : 'Item criado!');
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadPortfolio();
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast.error(error.message || 'Erro ao salvar item');
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      technologies: item.technologies,
      images: item.images,
      links: item.links,
      category: item.category,
      featured: item.featured,
      completedAt: item.completedAt ? item.completedAt.split('T')[0] : '',
      clientName: item.clientName || '',
      projectValue: item.projectValue || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir item');
      }

      toast.success('Item excluído com sucesso!');
      loadPortfolio();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: [],
      images: [],
      links: [],
      category: 'web',
      featured: false,
      completedAt: '',
      clientName: '',
      projectValue: 0
    });
    setNewTechnology('');
    setNewLink({ type: 'demo', url: '', label: '' });
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addLink = () => {
    if (newLink.url.trim() && newLink.label.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { ...newLink }]
      }));
      setNewLink({ type: 'demo', url: '', label: '' });
    }
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
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
          <h2 className="text-2xl font-bold text-gray-900">
            {isOwner ? 'Meu Portfolio' : 'Portfolio'}
          </h2>
          <p className="text-gray-600">
            {isOwner 
              ? 'Gerencie seus projetos e trabalhos realizados' 
              : 'Projetos e trabalhos realizados'}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Projeto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Categoria:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Editar Projeto' : 'Adicionar Novo Projeto'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Nome do projeto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Descreva o projeto, desafios enfrentados e soluções implementadas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Nome do cliente (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Projeto (R$)
                </label>
                <input
                  type="number"
                  value={formData.projectValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  value={formData.completedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, completedAt: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Projeto em destaque
                  </span>
                </label>
              </div>

              {/* Tecnologias */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tecnologias Utilizadas
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Ex: React, Node.js, MongoDB..."
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links do Projeto
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink(prev => ({ ...prev, type: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="demo">Demo</option>
                    <option value="github">GitHub</option>
                    <option value="website">Website</option>
                    <option value="other">Outro</option>
                  </select>
                  <input
                    type="text"
                    value={newLink.label}
                    onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Nome do link"
                  />
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium capitalize">{link.type}:</span>
                      <span className="text-sm text-blue-600">{link.label}</span>
                      <span className="text-sm text-gray-500 flex-1 truncate">({link.url})</span>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Atualizar' : 'Criar'} Projeto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-gray-600">
              {isOwner 
                ? 'Comece adicionando seus projetos e trabalhos realizados.' 
                : 'Este freelancer ainda não adicionou projetos ao portfolio.'}
            </p>
          </div>
        ) : (
          portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Badge de Featured */}
              {item.featured && (
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-medium px-3 py-1 text-center">
                  ⭐ Projeto em Destaque
                </div>
              )}

              {/* Imagem de Capa */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {categoryLabels[item.category]}
                    </span>
                  </div>
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>

                {/* Tecnologias */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.technologies.slice(0, 3).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{item.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Metadados */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  {item.completedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.completedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {item.projectValue && item.projectValue > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>R$ {item.projectValue.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                {/* Links */}
                {item.links.length > 0 && (
                  <div className="flex gap-2">
                    {item.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {link.type === 'github' ? (
                          <Github className="w-4 h-4" />
                        ) : link.type === 'demo' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 