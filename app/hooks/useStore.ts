import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'freelancer' | 'company';
  image?: string;
  emailVerified: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

interface AppState {
  user: User | null;
  notifications: Notification[];
  unreadNotificationsCount: number;
  theme: 'light' | 'dark';
  // Actions
  setUser: (user: User | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

type AppPersist = Pick<AppState, 'theme' | 'notifications'>;

const persistOptions: PersistOptions<AppState, AppPersist> = {
  name: 'app-storage',
  partialize: (state) => ({
    theme: state.theme,
    notifications: state.notifications,
  }),
};

type AppStateCreator = StateCreator<
  AppState,
  [],
  [['zustand/persist', AppPersist]]
>;

const createAppState: AppStateCreator = (set) => ({
  user: null,
  notifications: [],
  unreadNotificationsCount: 0,
  theme: 'light',

  setUser: (user: User | null) => set({ user }),

  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) =>
    set((state) => {
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        ...notification,
        read: false,
        createdAt: new Date(),
      };

      return {
        notifications: [newNotification, ...state.notifications].slice(0, 100), // Limitar a 100 notificações
        unreadNotificationsCount: state.unreadNotificationsCount + 1,
      };
    }),

  markNotificationAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
    })),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationsCount: 0,
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadNotificationsCount: state.unreadNotificationsCount - (state.notifications.find((n) => n.id === id)?.read ? 0 : 1),
    })),

  setTheme: (theme: 'light' | 'dark') => set({ theme }),
});

export const useStore = create<AppState>()(persist(createAppState, persistOptions)); 