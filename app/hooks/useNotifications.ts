'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useFetchAuth } from './useFetchAuth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth();
  const { fetchAuth } = useFetchAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar ref para evitar dependências instáveis
  const fetchAuthRef = useRef(fetchAuth);
  fetchAuthRef.current = fetchAuth;

  const fetchNotifications = useCallback(async () => {
    if (!user || !isAuthenticated) {
      console.log('🔔 useNotifications: Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('🔔 useNotifications: Carregando notificações...');
      setLoading(true);
      setError(null);

      const response = await fetchAuthRef.current(`/api/notifications/${user.uid}`);
      const data = await response.json();
      
      console.log('🔔 useNotifications: Notificações carregadas:', data.length || 0);
      setNotifications(data || []);
    } catch (error) {
      console.error('🔔 useNotifications: Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, isAuthenticated]); // Só dependências estáveis

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user || !isAuthenticated) return;

    try {
      console.log('🔔 useNotifications: Marcando notificação como lida:', notificationId);
      
      await fetchAuthRef.current(`/api/notifications/${user.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notificationId,
          action: 'mark_read'
        })
      });

      // Atualizar localmente
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      console.log('🔔 useNotifications: Notificação marcada como lida');
    } catch (error) {
      console.error('🔔 useNotifications: Erro ao marcar notificação:', error);
    }
  }, [user?.uid, isAuthenticated]);

  const markAllAsRead = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      console.log('🔔 useNotifications: Marcando todas as notificações como lidas');
      
      await fetchAuthRef.current(`/api/notifications/${user.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'mark_all_read'
        })
      });

      // Atualizar localmente
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      console.log('🔔 useNotifications: Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('🔔 useNotifications: Erro ao marcar todas as notificações:', error);
    }
  }, [user?.uid, isAuthenticated]);

  // Carregar notificações quando o usuário estiver disponível
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    if (user && isAuthenticated) {
      // Carregar imediatamente
      fetchNotifications();
      
      // Atualizar notificações a cada 30 segundos
      intervalId = setInterval(() => {
        if (mounted) {
          fetchNotifications();
        }
      }, 30000);
    } else {
      if (mounted) {
        setNotifications([]);
        setLoading(false);
        setError(null);
      }
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.uid, isAuthenticated, fetchNotifications]);

  // Calcular notificações não lidas
  const unreadCount = notifications.filter(notif => !notif.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
} 