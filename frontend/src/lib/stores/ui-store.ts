import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

export const useUIStore = create<UIState>(set => ({
  sidebarOpen: true,
  theme: 'system',
  notifications: [],
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: theme => set({ theme }),
  addNotification: notification =>
    set(state => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString(), timestamp: new Date() },
      ],
    })),
  removeNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
}));
