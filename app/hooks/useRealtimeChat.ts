'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  createdAt: string;
  isOwnMessage: boolean;
}

interface UseRealtimeChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  isConnected: boolean;
}

export function useRealtimeChat(contractId: string): UseRealtimeChatReturn {
  const { getAuthToken, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageId = useRef<string | null>(null);
  const retryCount = useRef<number>(0);
  const maxRetries = 3;

  // Carregar mensagens iniciais
  const loadMessages = useCallback(async () => {
    if (!contractId || !user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Token não disponível');
      }

      console.log(`Carregando mensagens para contrato: ${contractId}`);
      
      const response = await fetch(`/api/contracts/${contractId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Você não tem permissão para acessar estas mensagens.');
        }
        if (response.status === 404) {
          throw new Error('Contrato não encontrado.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const messagesData = await response.json();
      console.log(`Mensagens carregadas: ${messagesData?.length || 0}`);
      
      setMessages(messagesData || []);
      
      // Atualizar referência da última mensagem
      if (messagesData && messagesData.length > 0) {
        lastMessageId.current = messagesData[messagesData.length - 1].id;
      }
      
      setIsConnected(true);
      retryCount.current = 0; // Reset retry count on success
    } catch (err: any) {
      console.error('Erro ao carregar mensagens:', err);
      setError(err.message || 'Erro ao carregar mensagens');
      setIsConnected(false);
      
      // Incrementar contador de tentativas
      retryCount.current++;
      
      // Se ainda não excedeu o máximo de tentativas, tentar novamente em 5 segundos
      if (retryCount.current < maxRetries) {
        console.log(`Tentativa ${retryCount.current} de ${maxRetries} - Tentando novamente em 5 segundos...`);
        setTimeout(() => {
          if (contractId) loadMessages();
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [contractId, getAuthToken, user]);

  // Verificar novas mensagens (polling mais inteligente)
  const checkForNewMessages = useCallback(async () => {
    if (!contractId || loading || !user || !isConnected) return;

    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`/api/contracts/${contractId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsConnected(false);
          setError('Sessão expirada');
          return;
        }
        console.warn(`Erro no polling: ${response.status}`);
        return;
      }

      const messagesData = await response.json();
      
      // Verificar se há mensagens novas
      if (messagesData && messagesData.length > 0) {
        const lastMessageInResponse = messagesData[messagesData.length - 1];
        
        if (lastMessageId.current !== lastMessageInResponse.id) {
          setMessages(messagesData);
          lastMessageId.current = lastMessageInResponse.id;
          console.log('Novas mensagens detectadas via polling');
        }
      }
      
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      console.warn('Erro durante polling (não crítico):', err);
      // Não definir erro durante polling para não interromper a UX
    }
  }, [contractId, getAuthToken, loading, user, isConnected]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !contractId || !user) return;

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Token não disponível');
      }

      const response = await fetch(`/api/contracts/${contractId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao enviar mensagem';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const newMessage = await response.json();
      
      // Adicionar a mensagem localmente (otimistic update)
      setMessages(prev => [...prev, newMessage]);
      lastMessageId.current = newMessage.id;
      
      // Verificar imediatamente por atualizações para sincronizar
      setTimeout(checkForNewMessages, 1000);
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      throw err;
    }
  }, [contractId, getAuthToken, checkForNewMessages, user]);

  // Inicializar e configurar polling
  useEffect(() => {
    if (contractId && user) {
      console.log(`Inicializando chat para contrato: ${contractId}`);
      loadMessages();
      
      // Configurar polling mais inteligente
      const startPolling = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') {
            checkForNewMessages();
          }
        }, 3000); // Aumentado para 3 segundos para ser menos agressivo
      };

      // Iniciar polling após 2 segundos (depois do carregamento inicial)
      const timeoutId = setTimeout(startPolling, 2000);

      return () => {
        clearTimeout(timeoutId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [contractId, user, loadMessages, checkForNewMessages]);

  // Parar polling quando a aba não está visível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (document.visibilityState === 'visible' && contractId && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          checkForNewMessages();
        }, 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [contractId, checkForNewMessages]);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    isConnected
  };
} 