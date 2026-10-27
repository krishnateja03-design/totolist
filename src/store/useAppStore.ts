/**
 * @file store/useAppStore.ts
 * @description Global application state store powered by Zustand with localStorage persistence.
 *
 * This is the single source of truth for all mutable application data in Nexus PM.
 * All pages and components read state and dispatch actions through this store.
 *
 * Persistence:
 *   - State is automatically saved to localStorage under the key
 *     "enterprise-project-manager-store-v2" via the Zustand `persist` middleware.
 *   - On first load, the store hydrates from localStorage if data exists,
 *     otherwise it uses the default values from sampleData.ts.
 *
 * Usage:
 *   // Read state in a component:
 *   const tasks = useAppStore((s) => s.tasks);
 *
 *   // Dispatch an action:
 *   const addTask = useAppStore((s) => s.addTask);
 *   addTask({ title: "New task", status: "backlog", ... });
 */

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

/**
 * The complete shape of the global application store.
 * Includes both state slices and action methods.
 *
 * State slices:
 *   - theme            → Light or dark mode preference
 *   - projects         → All projects in the portfolio
 *   - selectedProjectId → Currently scoped project filter ("all" = no filter)
 *   - tasks            → All work items across all projects
 *   - columns          → Kanban board column definitions (static)
 *   - notifications    → In-app notification feed
 *   - goals            → High-level OKR goals visible on the dashboard
 *
 * Action groups:
 *   - Theme actions    → toggleTheme
 *   - Project actions  → addProject, updateProject, deleteProject, toggleMilestone, addMilestone, addProjectNote
 *   - Task actions     → addTask, updateTask, deleteTask, moveTask, logTaskHours
 *   - Util actions     → clearAllData, markNotification, clearNotifications, updateGoal
 */
type Store = {
  // ─── State ───────────────────────────────────────────────────────────────
  theme: Theme;
  projects: Project[];
  /** "all" means no project filter is active; otherwise filters by project ID */
  selectedProjectId: string | "all";
  tasks: Task[];
  columns: typeof columns;
  notifications: Notification[];
  goals: Goal[];

  // ─── Theme Actions ────────────────────────────────────────────────────────
  /** Toggles between "light" and "dark" theme and applies the class to <html> */
  toggleTheme: () => void;

  /** Sets the active project scope filter. Pass "all" to see all projects. */
  setSelectedProject: (projectId: string | "all") => void;

  // ─── Project Actions ──────────────────────────────────────────────────────

  /**
   * Creates a new project and prepends it to the projects array.
   * Also auto-generates a "created project" activity log entry and a notification.
   * @param project - All project fields except `id` (auto-generated as "prj-<uuid>")
   */
  addProject: (project: Omit<Project, "id">) => void;

  /**
   * Fully replaces an existing project's data with the provided object.
   * Matched by `project.id`. Does not modify other projects.
   * @param project - The complete updated Project object (must include the existing id)
   */
  updateProject: (project: Project) => void;

  /**
   * Permanently removes a project and all its associated tasks from the store.
   * If the deleted project was the currently selected scope, resets filter to "all".
   * @param id - The project ID to delete
   */
  deleteProject: (id: string) => void;

  /**
   * Toggles the `completed` state of a milestone within a specific project.
   * Also appends an "updated milestone" activity entry to the project's log.
   * @param projectId   - The ID of the parent project
   * @param milestoneId - The ID of the milestone to toggle
   */
  toggleMilestone: (projectId: string, milestoneId: string) => void;

  /**
   * Adds a new milestone to the specified project's milestones array.
   * The milestone ID is auto-generated as "m-<random>".
   * @param projectId - The ID of the parent project
   * @param milestone - Milestone data excluding the `id` field
   */
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, "id">) => void;

  /**
   * Creates a new note document under the specified project.
   * The note ID is auto-generated as "n-<random>" and `updatedAt` is set to "Just now".
   * Notes are prepended to the project's `notes` array.
   * @param projectId - The ID of the parent project
   * @param note - Note data excluding `id` and `updatedAt` fields
   */
  addProjectNote: (projectId: string, note: Omit<ProjectNote, "id" | "updatedAt">) => void;

  // ─── Task Actions ─────────────────────────────────────────────────────────

  /**
   * Creates a new task and prepends it to the global tasks array.
   * Auto-generates a task ID as "t-<uuid>", sets default loggedHours to 0,
   * and default estimatedHours to 4. Also fires a notification.
   * @param task - All task fields except `id`
   */
  addTask: (task: Omit<Task, "id">) => void;

  /**
   * Fully replaces an existing task's data with the provided object.
   * Matched by `task.id`. Use this for edits from the TaskModal.
   * @param task - The complete updated Task object (must include the existing id)
   */
  updateTask: (task: Task) => void;

  /**
   * Permanently removes a task from the store by its ID.
   * Called from TaskCard delete button and the Tasks page bulk delete action.
   * @param id - The task ID to remove
   */
  deleteTask: (id: string) => void;

  /**
   * Moves a task to a different Kanban status column.
   * If the new status is "done", the task's `progress` is automatically set to 100.
   * Called by the DnD drop handler in KanbanBoard.
   * @param id     - The task ID to move
   * @param status - The target pipeline stage
   */
  moveTask: (id: string, status: Status) => void;

  /**
   * Increments the `loggedHours` of a task by the given amount.
   * Called from the quick "Log Time" popover on the TaskCard.
   * @param id              - The task ID to update
   * @param additionalHours - The number of hours to add (must be positive)
   */
  logTaskHours: (id: string, additionalHours: number) => void;

  // ─── Utility Actions ──────────────────────────────────────────────────────

  /**
   * Wipes all projects, tasks, notifications, and goals from the store.
   * Useful for resetting to a blank-slate state from the Settings page.
   * Does NOT reset theme preference.
   */
  clearAllData: () => void;

  /**
   * Marks a single notification as read by its ID.
   * The unread badge count in the header updates reactively.
   * @param id - The notification ID to mark as read
   */
  markNotification: (id: string) => void;

  /**
   * Marks ALL notifications as read in one operation.
   * Called from the "Mark all read" button in the NotificationsDropdown.
   */
  clearNotifications: () => void;

  /**
   * Updates the progress percentage of a Goal on the Dashboard.
   * @param id       - The goal ID to update
   * @param progress - New progress value from 0-100
   */
  updateGoal: (id: string, progress: number) => void;
};

/**
 * The Zustand store instance. Use this hook in any React component to access
 * state or dispatch actions. The `persist` middleware serializes state to
 * localStorage automatically on every state change.
 *
 * @example
 * // Read a state slice (component re-renders only when `tasks` changes)
 * const tasks = useAppStore((s) => s.tasks);
 *
 * @example
 * // Read an action (actions never cause re-renders; safe to destructure)
 * const addTask = useAppStore((s) => s.addTask);
 */
export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      // ─── Initial State ──────────────────────────────────────────────────
      // On first load these are the default values from sampleData.ts.
      // After the first render, localStorage takes precedence (via persist middleware).

      theme: "light",
      projects: sampleProjects,       // [] by default – users create their own projects
      selectedProjectId: "all",       // Show all projects on first load
      tasks,                          // [] by default – clean slate
      columns,                        // Static Kanban column definitions
      notifications,                  // [] by default
      goals,                          // [] by default

      // ─── Theme ─────────────────────────────────────────────────────────

      toggleTheme: () =>
        set((s) => {
          // Calculate the new theme (opposite of current)
          const theme = s.theme === "light" ? "dark" : "light";
          // Apply the "dark" class to <html> so Tailwind's dark: variants activate
          document.documentElement.classList.toggle("dark", theme === "dark");
          return { theme };
        }),

      setSelectedProject: (selectedProjectId) => set({ selectedProjectId }),

      // ─── Project CRUD ───────────────────────────────────────────────────

      addProject: (project) =>
        set((s) => {
          // Build the full project object with a generated ID and initial activity log
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
            // Prepend the new project so it appears first in the list
            projects: [newProject, ...s.projects],
            // Auto-fire a notification visible in the bell dropdown
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
          // Replace only the project matching by ID; leave all others untouched
          projects: s.projects.map((p) => (p.id === project.id ? project : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({
          // Remove the project
          projects: s.projects.filter((p) => p.id !== id),
          // Cascade-delete all tasks that belonged to this project
          tasks: s.tasks.filter((t) => t.projectId !== id),
          // If the deleted project was selected, reset scope to "all"
          selectedProjectId: s.selectedProjectId === id ? "all" : s.selectedProjectId,
        })),

      toggleMilestone: (projectId, milestoneId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p; // Skip unrelated projects

            return {
              ...p,
              // Flip the `completed` flag on the matching milestone
              milestones: p.milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed: !m.completed } : m,
              ),
              // Prepend an activity log entry for audit trail
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
              // Append the new milestone with an auto-generated ID
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
              // Prepend the new note with auto-generated ID and timestamp
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

      // ─── Task CRUD ──────────────────────────────────────────────────────

      addTask: (task) =>
        set((s) => {
          // Build the full task object with defaults for optional fields
          const newTask: Task = {
            ...task,
            id: `t-${crypto.randomUUID().slice(0, 8)}`,
            loggedHours: task.loggedHours ?? 0,       // Default: no hours logged yet
            estimatedHours: task.estimatedHours ?? 4, // Default: 4h estimate
          };
          return {
            // Prepend so the newest task appears first in tables/boards
            tasks: [newTask, ...s.tasks],
            // Auto-fire a notification
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
                  // Auto-complete progress when task is moved to "done"
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

      // ─── Utility ────────────────────────────────────────────────────────

      clearAllData: () =>
        set({
          // Reset all user-created data; columns and theme are intentionally preserved
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
          // Mark every notification as read without removing them
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      updateGoal: (id, progress) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, progress } : g)),
        })),
    }),
    {
      // The key under which state is saved in localStorage.
      // Changing this key effectively resets all persisted data on next load.
      name: "enterprise-project-manager-store-v2",
    },
  ),
);
