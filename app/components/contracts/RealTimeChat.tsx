'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'MILESTONE_UPDATE' | 'PAYMENT_REQUEST' | 'DELIVERY';
  attachments?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    userType: string;
  };
}

interface RealTimeChatProps {
  contractId: string;
  contract: {
    freelancer: {
      id: string;
      name: string;
    };
    company: {
      id: string;
      name: string;
      companyName?: string;
    };
    project: {
      title: string;
    };
  };
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function RealTimeChat({ 
  contractId, 
  contract, 
  isMinimized = false,
  onToggleMinimize 
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
  }, [contractId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/contracts/${contractId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;

    try {
      setSending(true);
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/contracts/${contractId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          type: 'TEXT'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'FILE': return <Paperclip className="w-4 h-4" />;
      case 'MILESTONE_UPDATE': return <Info className="w-4 h-4" />;
      case 'PAYMENT_REQUEST': return <span className="text-green-600">💰</span>;
      case 'DELIVERY': return <span className="text-blue-600">📦</span>;
      default: return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const otherParticipant = user?.uid === contract.freelancer.id ? 
    (contract.company.companyName || contract.company.name) : 
    contract.freelancer.name;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 w-80 z-50"
      >
        <div 
          className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg cursor-pointer"
          onClick={onToggleMinimize}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <h3 className="font-medium">{otherParticipant}</h3>
              <p className="text-sm opacity-90">{contract.project.title}</p>
            </div>
          </div>
          <MoreVertical className="w-5 h-5" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-[500px] z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <div>
            <h3 className="font-medium">{otherParticipant}</h3>
            <p className="text-sm opacity-90">{contract.project.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-blue-700 rounded">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-blue-700 rounded">
            <Video className="w-4 h-4" />
          </button>
          <button 
            className="p-1 hover:bg-blue-700 rounded"
            onClick={onToggleMinimize}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Inicie uma conversa!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isOwn = message.sender.id === user?.uid;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {message.type !== 'TEXT' && (
                      <div className="flex items-center gap-2 mb-1 text-sm opacity-80">
                        {getMessageTypeIcon(message.type)}
                        <span className="capitalize">{message.type.replace('_', ' ')}</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              rows={1}
              style={{ maxHeight: '80px' }}
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-lg transition-colors ${
              newMessage.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
} 