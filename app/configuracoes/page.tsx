'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    pushNotifications: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Se ainda está carregando o estado de autenticação, aguardar
        if (loading) return;

        // Se não há usuário após carregar, redirecionar para login
        if (!user) {
          console.log('Usuário não autenticado, redirecionando para login...');
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();
  }, [user, loading, router, pathname]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token || !user) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar senha');
      }

      setSuccess('Senha alterada com sucesso');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await fetch('/api/users/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [name]: checked,
        }),
      });
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    }
  };

  // Mostrar loading se ainda está carregando ou não há usuário
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-8">
            Configurações
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'security'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Segurança
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'notifications'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Notificações
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Informações do Perfil
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <p className="text-slate-600">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tipo de Conta
                      </label>
                      <p className="text-slate-600 capitalize">
                        {user.userType === 'company' ? 'Empresa' : 'Freelancer'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Alterar Senha
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input-field"
                        required
                      />
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                        {success}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                          Alterando...
                        </div>
                      ) : (
                        'Alterar Senha'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Preferências de Notificação
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-slate-700">
                          Notificações por Email
                        </h3>
                        <p className="text-sm text-slate-500">
                          Receba atualizações sobre suas vagas e propostas por
                          email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-slate-700">
                          Notificações Push
                        </h3>
                        <p className="text-sm text-slate-500">
                          Receba notificações em tempo real no seu navegador
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="pushNotifications"
                          checked={formData.pushNotifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}