'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Avatar } from '@/components/ui/Avatar';
import ReviewSystem from '@/app/components/reviews/ReviewSystem';
import { 
  User, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Link as LinkIcon,
  Building,
  Users,
  Globe,
  Edit3,
  Save,
  X,
  Plus,
  Award
} from 'lucide-react';

interface ProfileData {
  name: string;
  bio: string;
  skills: string[];
  image: string | null;
  // Campos para freelancers
  hourlyRate?: number;
  availability?: string;
  portfolio?: string;
  yearsOfExperience?: number;
  languages?: string[];
  // Campos para empresas
  companyName?: string;
  companySize?: string;
  industry?: string;
  companyWebsite?: string;
  companyLocation?: string;
}

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    skills: [],
    image: null,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Carregar dados do perfil
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/users/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            name: data.name || '',
            bio: data.bio || '',
            skills: data.skills ? JSON.parse(data.skills) : [],
            image: data.image,
            // Campos para freelancers
            hourlyRate: data.hourlyRate,
            availability: data.availability,
            portfolio: data.portfolio,
            yearsOfExperience: data.yearsOfExperience,
            languages: data.languages,
            // Campos para empresas
            companyName: data.companyName,
            companySize: data.companySize,
            industry: data.industry,
            companyWebsite: data.companyWebsite,
            companyLocation: data.companyLocation,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${user?.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          skills: JSON.stringify(profileData.skills),
        }),
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      if (!user) return;
      
      // Atualizar a imagem no estado local
      setProfileData(prev => ({ ...prev, image: imageUrl }));
      
      // Atualizar no servidor
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: imageUrl })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar imagem');
      }

      console.log('Imagem atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error);
    }
  };

  if (!user) return null;

  const isCompany = user.userType === 'company';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isCompany ? 'Perfil da Empresa' : 'Meu Perfil'}
          </h1>
          <p className="text-slate-600">
            {isCompany ? 'Gerencie as informações da sua empresa' : 'Gerencie suas informações profissionais'}
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informações do Perfil
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
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

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Esquerda - Informações Principais */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card Principal */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg border border-slate-100 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Informações Básicas
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar e Nome */}
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      {isEditing ? (
                        <ImageUpload
                          currentImage={profileData.image}
                          userName={profileData.name}
                          size="xl"
                          onImageUploaded={handleImageUpload}
                        />
                      ) : (
                        <Avatar
                          src={profileData.image}
                          alt={profileData.name}
                          size="xl"
                          fallbackText={profileData.name}
                          className="shadow-lg"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Nome */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nome
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Seu nome"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-slate-800">
                            {profileData.name || 'Nome não informado'}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>

                      {/* Tipo de usuário */}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCompany 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isCompany ? 'Empresa' : 'Freelancer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {isCompany ? 'Sobre a Empresa' : 'Sobre mim'}
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                        placeholder={isCompany ? 'Descreva sua empresa...' : 'Conte um pouco sobre você...'}
                      />
                    ) : (
                      <p className="text-slate-600 leading-relaxed">
                        {profileData.bio || 'Nenhuma descrição adicionada.'}
                      </p>
                    )}
                  </div>

                  {/* Skills - apenas para freelancers */}
                  {!isCompany && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Habilidades
                      </label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Adicionar habilidade (pressione Enter)"
                              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSkillAdd(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills.map(skill => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleSkillRemove(skill)}
                                  className="ml-2 text-blue-500 hover:text-blue-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.length > 0 ? (
                            profileData.skills.map(skill => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-slate-500">Nenhuma habilidade adicionada.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões de Ação */}
                  {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </div>

            {/* Coluna Direita - Informações Adicionais */}
            <div className="space-y-6">
              {/* Card Freelancer */}
              {!isCompany && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-slate-100 p-6"
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Informações Profissionais
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Taxa Horária */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-700">Taxa Horária</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={profileData.hourlyRate || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                          className="w-24 px-2 py-1 text-sm border border-slate-200 rounded"
                          placeholder="150"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-sm text-slate-600">
                          {profileData.hourlyRate ? `R$ ${profileData.hourlyRate.toLocaleString('pt-BR')}/h` : 'Não informado'}
                        </span>
                      )}
                    </div>

                    {/* Experiência */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-slate-700">Experiência</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={profileData.yearsOfExperience || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) }))}
                          className="w-16 px-2 py-1 text-sm border border-slate-200 rounded"
                          placeholder="5"
                          min="0"
                        />
                      ) : (
                        <span className="text-sm text-slate-600">
                          {profileData.yearsOfExperience ? `${profileData.yearsOfExperience} anos` : 'Não informado'}
                        </span>
                      )}
                    </div>

                    {/* Disponibilidade */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Disponibilidade</span>
                      </div>
                      {isEditing ? (
                        <select
                          value={profileData.availability || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                          className="px-2 py-1 text-sm border border-slate-200 rounded"
                        >
                          <option value="">Selecione...</option>
                          <option value="full-time">Tempo Integral</option>
                          <option value="part-time">Meio Período</option>
                          <option value="contract">Contrato</option>
                        </select>
                      ) : (
                        <span className="text-sm text-slate-600">
                          {profileData.availability === 'full-time' ? 'Tempo Integral' :
                           profileData.availability === 'part-time' ? 'Meio Período' :
                           profileData.availability === 'contract' ? 'Contrato' : 'Não informado'}
                        </span>
                      )}
                    </div>

                    {/* Portfolio */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-700">Portfólio</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profileData.portfolio || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, portfolio: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="https://portfolio.com"
                        />
                      ) : (
                        <div className="text-sm">
                          {profileData.portfolio ? (
                            <a
                              href={profileData.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 break-all"
                            >
                              {profileData.portfolio}
                            </a>
                          ) : (
                            <span className="text-slate-500">Não informado</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Card Empresa */}
              {isCompany && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-slate-100 p-6"
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    Dados da Empresa
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome da Empresa */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.companyName || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="Nome da sua empresa"
                        />
                      ) : (
                        <p className="text-sm text-slate-600">{profileData.companyName || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Tamanho da Empresa */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Tamanho</span>
                      </div>
                      {isEditing ? (
                        <select
                          value={profileData.companySize || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, companySize: e.target.value }))}
                          className="px-2 py-1 text-sm border border-slate-200 rounded"
                        >
                          <option value="">Selecione...</option>
                          <option value="1-10">1-10 funcionários</option>
                          <option value="11-50">11-50 funcionários</option>
                          <option value="51-200">51-200 funcionários</option>
                          <option value="201-500">201-500 funcionários</option>
                          <option value="501+">501+ funcionários</option>
                        </select>
                      ) : (
                        <span className="text-sm text-slate-600">
                          {profileData.companySize || 'Não informado'}
                        </span>
                      )}
                    </div>

                    {/* Setor */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Setor de Atuação</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.industry || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="Ex: Tecnologia"
                        />
                      ) : (
                        <p className="text-sm text-slate-600">{profileData.industry || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-700">Website</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profileData.companyWebsite || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="https://empresa.com"
                        />
                      ) : (
                        <div className="text-sm">
                          {profileData.companyWebsite ? (
                            <a
                              href={profileData.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 break-all"
                            >
                              {profileData.companyWebsite}
                            </a>
                          ) : (
                            <span className="text-slate-500">Não informado</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Localização */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-slate-700">Localização</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.companyLocation || ''}
                          onChange={e => setProfileData(prev => ({ ...prev, companyLocation: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="São Paulo, SP"
                        />
                      ) : (
                        <p className="text-sm text-slate-600">{profileData.companyLocation || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
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