'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/app/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  // TODO: Implementar deleteNotification no hook
  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    // deleteNotification(notificationId);
    console.log('Delete notification:', notificationId);
  };

  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">
                  Notificações
                </h3>
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  Nenhuma notificação
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        notification.read
                          ? 'bg-white'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-slate-800">
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 