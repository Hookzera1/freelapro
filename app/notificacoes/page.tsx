'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useFetchAuth } from '@/hooks/useFetchAuth';

interface Notification {
  uid: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
}

export default function NotificacoesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { fetchAuth } = useFetchAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Se ainda está carregando o estado de autenticação, aguardar
        if (loading) return;

        // Se não há usuário após carregar, redirecionar para login
        if (!user) {
          console.log('Usuário não autenticado, redirecionando para login...');
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        await fetchNotifications();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        const currentPath = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    };

    checkAuth();
  }, [user, router, loading, fetchAuth]);

  const fetchNotifications = async () => {
    try {
      const response = await fetchAuth('/api/notifications');

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data = await response.json();
      setNotifications(data.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      })));
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Não foi possível carregar as notificações. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (uid: string) => {
    try {
      const response = await fetchAuth(`/api/notifications/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ read: true })
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida');
      }

      setNotifications(prev =>
        prev.map(n => n.uid === uid ? { ...n, read: true } : n)
      );
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Não foi possível marcar a notificação como lida. Tente novamente.');
    }
  };

  const deleteNotification = async (uid: string) => {
    try {
      const response = await fetchAuth(`/api/notifications/${uid}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar notificação');
      }

      setNotifications(prev => prev.filter(n => n.uid !== uid));
      toast.success('Notificação removida com sucesso');
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Não foi possível remover a notificação. Tente novamente.');
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800">Notificações</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">
            Nenhuma notificação
          </h2>
          <p className="text-slate-500">
            Você não tem nenhuma notificação no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.uid}
              className={`p-4 rounded-lg border ${getNotificationStyle(notification.type)} ${
                notification.read ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-slate-600">{notification.message}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      onClick={() => markAsRead(notification.uid)}
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteNotification(notification.uid)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 