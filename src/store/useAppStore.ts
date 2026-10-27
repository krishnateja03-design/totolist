import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  columns,
  goals,
  notifications,
  sampleProjects,
  tasks,
} from "../data/sampleData";
import {
  Goal,
  Notification,
  Project,
  ProjectMilestone,
  ProjectNote,
  Status,
  Task,
  Theme,
} from "../types";

type Store = {
  theme: Theme;
  projects: Project[];
  selectedProjectId: string | "all";
  tasks: Task[];
  columns: typeof columns;
  notifications: Notification[];
  goals: Goal[];

  toggleTheme: () => void;
  setSelectedProject: (projectId: string | "all") => void;

  // Project Actions
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, "id">) => void;
  addProjectNote: (projectId: string, note: Omit<ProjectNote, "id" | "updatedAt">) => void;

  // Task Actions
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Status) => void;
  logTaskHours: (id: string, additionalHours: number) => void;

  // Reset / Clear Actions
  clearAllData: () => void;
  markNotification: (id: string) => void;
  clearNotifications: () => void;
  updateGoal: (id: string, progress: number) => void;
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      theme: "light",
      projects: sampleProjects,
      selectedProjectId: "all",
      tasks,
      columns,
      notifications,
      goals,

      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle("dark", theme === "dark");
          return { theme };
        }),

      setSelectedProject: (selectedProjectId) => set({ selectedProjectId }),

      addProject: (project) =>
        set((s) => {
          const newProject: Project = {
            ...project,
            id: `prj-${crypto.randomUUID().slice(0, 8)}`,
            activity: [
              {
                id: crypto.randomUUID(),
                user: "Krishna Teja",
                action: "created project",
                details: project.name,
                timestamp: "Just now",
              },
            ],
          };
          return {
            projects: [newProject, ...s.projects],
            notifications: [
              {
                id: crypto.randomUUID(),
                title: "New Project Initiated",
                message: `Project "${project.name}" has been created.`,
                type: "project",
                read: false,
                time: "Just now",
              },
              ...s.notifications,
            ],
          };
        }),

      updateProject: (project) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === project.id ? project : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
          selectedProjectId: s.selectedProjectId === id ? "all" : s.selectedProjectId,
        })),

      toggleMilestone: (projectId, milestoneId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              milestones: p.milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed: !m.completed } : m,
              ),
              activity: [
                {
                  id: crypto.randomUUID(),
                  user: "You",
                  action: "updated milestone",
                  details: milestoneId,
                  timestamp: "Just now",
                },
                ...(p.activity || []),
              ],
            };
          }),
        })),

      addMilestone: (projectId, milestone) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              milestones: [
                ...p.milestones,
                { ...milestone, id: `m-${crypto.randomUUID().slice(0, 6)}` },
              ],
            };
          }),
        })),

      addProjectNote: (projectId, note) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              notes: [
                {
                  ...note,
                  id: `n-${crypto.randomUUID().slice(0, 6)}`,
                  updatedAt: "Just now",
                },
                ...(p.notes || []),
              ],
            };
          }),
        })),

      addTask: (task) =>
        set((s) => {
          const newTask: Task = {
            ...task,
            id: `t-${crypto.randomUUID().slice(0, 8)}`,
            loggedHours: task.loggedHours ?? 0,
            estimatedHours: task.estimatedHours ?? 4,
          };
          return {
            tasks: [newTask, ...s.tasks],
            notifications: [
              {
                id: crypto.randomUUID(),
                title: "New Task Logged",
                message: `"${task.title}" added to pipeline.`,
                type: "task",
                read: false,
                time: "Just now",
              },
              ...s.notifications,
            ],
          };
        }),

      updateTask: (task) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === task.id ? task : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),

      moveTask: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  progress: status === "done" ? 100 : t.progress,
                }
              : t,
          ),
        })),

      logTaskHours: (id, additionalHours) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, loggedHours: (t.loggedHours || 0) + additionalHours }
              : t,
          ),
        })),

      clearAllData: () =>
        set({
          projects: [],
          tasks: [],
          notifications: [],
          goals: [],
          selectedProjectId: "all",
        }),

      markNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      clearNotifications: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      updateGoal: (id, progress) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
        })),
    }),
    {
      name: "enterprise-project-manager-store-v2",
    },
  ),
);
