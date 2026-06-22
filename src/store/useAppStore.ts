import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { columns } from '../data/sampleData';
import { Goal, Notification, Status, Task, Theme } from '../types';

type Store = {
  theme: Theme;
  tasks: Task[];
  columns: typeof columns;
  notifications: Notification[];
  goals: Goal[];
  toggleTheme: () => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Status) => void;
  markNotification: (id: string) => void;
  updateGoal: (id: string, progress: number) => void;
};

export const useAppStore = create<Store>()(
  persist(
    set => ({
      theme: 'light',
      tasks: [],
      columns,
      notifications: [],
      goals: [],

      toggleTheme: () =>
        set(s => {
          const theme = s.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', theme === 'dark');
          return { theme };
        }),

      addTask: task =>
        set(s => ({
          tasks: [{ ...task, id: crypto.randomUUID() }, ...s.tasks],
        })),

      updateTask: task =>
        set(s => ({
          tasks: s.tasks.map(t => (t.id === task.id ? task : t)),
        })),

      deleteTask: id =>
        set(s => ({
          tasks: s.tasks.filter(t => t.id !== id),
        })),

      moveTask: (id, status) =>
        set(s => ({
          tasks: s.tasks.map(t => (t.id === id ? { ...t, status } : t)),
        })),

      markNotification: id =>
        set(s => ({
          notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
        })),

      updateGoal: (id, progress) =>
        set(s => ({
          goals: s.goals.map(g => (g.id === id ? { ...g, progress } : g)),
        })),
    }),
    {
      name: 'wow-saas-productivity-store',
    }
  )
);