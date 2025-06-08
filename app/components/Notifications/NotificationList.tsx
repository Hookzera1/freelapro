import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

interface Notification {
  uid: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (uid: string) => {
    try {
      const response = await fetch(`/api/notifications/${uid}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(notifications.map(notification =>
          notification.uid === uid ? { ...notification, read: true } : notification
        ));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const deleteNotification = async (uid: string) => {
    try {
      const response = await fetch(`/api/notifications/${uid}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotifications(notifications.filter(notification => notification.uid !== uid));
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-gray-500">
        <Bell className="w-8 h-8 mb-2" />
        <p>Nenhuma notificação</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <div
          key={notification.uid}
          className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.uid)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Marcar como lida"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.uid)}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Remover notificação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 