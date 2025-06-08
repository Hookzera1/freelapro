'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useFetchAuth } from '@/app/hooks/useFetchAuth';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  contractId: string;
}

export default function MensagensPage() {
  const { user, loading: authLoading } = useAuth();
  const { fetchAuth } = useFetchAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadMessages();
    }
  }, [authLoading, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Implementar busca de mensagens aqui
      // const response = await fetchAuth('/api/messages');
      // if (response.ok) {
      //   const data = await response.json();
      //   setMessages(data);
      // }
      setMessages([]); // Temporário
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Mensagens
        </h1>
        
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Nenhuma mensagem ainda
            </h3>
            <p className="text-slate-500">
              Suas conversas com clientes e freelancers aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800">
                    {message.senderName}
                  </h3>
                  <span className="text-sm text-slate-500">
                    {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-600">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 