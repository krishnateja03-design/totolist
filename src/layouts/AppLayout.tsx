/**
 * @file layouts/AppLayout.tsx
 * @description The root layout wrapper for all authenticated pages in Nexus PM.
 *
 * Responsibilities:
 *   1. Renders the collapsible Sidebar navigation (desktop: always visible, mobile: slide-in drawer)
 *   2. Renders the sticky top Topbar with notification bell, theme toggle, and quick-add buttons
 *   3. Wraps the active page content in a Framer Motion fade/slide transition
 *   4. Hosts the TaskModal and ProjectModal portals – these are app-level overlays
 *      triggered from both the Topbar buttons AND from individual page components via local state
 *
 * Dark Mode:
 *   - Controlled via `useAppStore.theme` and `useAppStore.toggleTheme()`
 *   - The "dark" class is applied to `<html>` so Tailwind's dark: variants activate globally
 *   - Persisted to localStorage via Zustand persist middleware
 *
 * Routing:
 *   - Uses React Router v6 `<Outlet />` to render the active child route
 *   - The `routeTitles` map drives the dynamic page title/subtitle in the Topbar
 *
 * Sidebar Project Switcher:
 *   - A <select> dropdown lets users scope all views to a single project
 *   - Setting selectedProjectId to "all" removes the filter (global view)
 */
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChartNoAxesCombined,
  FolderKanban,
  Home,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  Users,
  X,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import { useAppStore } from "../store/useAppStore";
import { NotificationsDropdown } from "../features/NotificationsDropdown";
import { TaskModal } from "../features/TaskModal";
import { ProjectModal } from "../features/ProjectModal";

/**
 * Navigation links rendered in the Sidebar.
 * Each entry is a tuple of [route path, display label, Lucide icon component].
 * The active link is highlighted with a gradient pill via Framer Motion `layoutId`.
 */
const links = [
  ["/", "Dashboard", Home],
  ["/projects", "Projects", FolderKanban],
  ["/timeline", "Gantt Timeline", Clock],
  ["/board", "Workflow Board", LayoutDashboard],
  ["/tasks", "All Work Items", ListChecks],
  ["/team", "Team Matrix", Users],
  ["/analytics", "Analytics", ChartNoAxesCombined],
  ["/settings", "Settings", Settings],
] as const;

/**
 * Maps each route pathname to the Topbar title and subtitle.
 * For dynamic routes (e.g., /projects/:id), a fallback is computed in AppLayout.
 * These strings are shown in the sticky header above the page content.
 */
const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Executive Dashboard", subtitle: "Portfolio metrics & delivery velocity" },
  "/projects": { title: "Projects Hub", subtitle: "Strategic initiatives & roadmaps" },
  "/timeline": { title: "Gantt & Delivery Schedule", subtitle: "Milestones, task durations & timelines" },
  "/board": { title: "Kanban Board", subtitle: "Agile workflow & delivery pipeline" },
  "/tasks": { title: "Task Manager", subtitle: "Filter, search & bulk operations" },
  "/team": { title: "Team & Capacity", subtitle: "Workload distribution & online status" },
  "/analytics": { title: "Analytics & Telemetry", subtitle: "Performance metrics, hours & budget burn" },
  "/settings": { title: "Platform Settings", subtitle: "Preferences, theme & workspace options" },
};

/**
 * The collapsible left sidebar containing navigation, project switcher, and quick actions.
 *
 * On desktop (lg+): Always visible as a sticky sidebar.
 * On mobile (<lg): Hidden off-screen (left: -80) and slides in via an `open` prop.
 *                   A semi-transparent backdrop overlay closes it when tapped.
 *
 * @param open         - Whether the mobile drawer is open
 * @param onClose      - Callback to close the mobile drawer (called on backdrop click, nav link click, X button)
 * @param onNewTask    - Opens the global TaskModal (wired to the "New Work Item" button)
 * @param onNewProject - Opens the global ProjectModal (wired to the "+ Project" link)
 */
function Sidebar({
  open,
  onClose,
  onNewTask,
  onNewProject,
}: {
  open: boolean;
  onClose: () => void;
  onNewTask: () => void;
  onNewProject: () => void;
}) {
  const projects = useAppStore((s) => s.projects);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : 0 }}
        className={`fixed z-40 flex h-dvh w-72 flex-col p-4 lg:sticky lg:top-0 ${
          open ? "left-0" : "-left-80 lg:left-0"
        }`}
      >
        <div className="glass flex h-full flex-col rounded-[2rem] p-4 border border-white/20 dark:border-white/10">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/25"
              >
                <Zap size={22} />
              </motion.div>
              <div>
                <b className="gradient-text text-xl font-black tracking-tight">Nexus PM</b>
                <p className="text-[11px] font-semibold text-slate-500">Enterprise Project OS</p>
              </div>
            </div>
            <button
              aria-label="Close navigation"
              className="rounded-xl p-1 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Project Switcher pill */}
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 border border-indigo-500/20">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <span>Scope Filter</span>
              <button
                onClick={onNewProject}
                className="hover:text-indigo-700 flex items-center gap-0.5 text-[10px]"
                title="Create new project"
              >
                <Plus size={12} /> Project
              </button>
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-xl bg-white/70 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none border border-black/5 dark:border-white/10"
            >
              <option value="all">⚡ All Initiatives ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nav links */}
          <nav className="thin-scroll mt-4 flex-1 space-y-1 overflow-y-auto">
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
                      />
                    )}
                    <Icon className="relative" size={17} />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
            <Button
              onClick={onNewTask}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 py-2.5 text-xs font-bold"
            >
              <Plus size={16} />
              <span>New Work Item</span>
            </Button>
          </div>

          {/* User Profile */}
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 shadow-xs dark:bg-slate-800/70 border border-black/5 dark:border-white/5">
            <Avatar name="KT" />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-xs font-bold">Krishna Teja</b>
              <p className="truncate text-[10px] text-slate-400">Engineering Lead</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

/**
 * Root layout component wrapping all authenticated pages.
 *
 * Owns all global UI state that overlays the entire app:
 *   - `mobile`         → Whether the mobile sidebar drawer is open
 *   - `notif`          → Whether the notifications dropdown is open
 *   - `taskModalOpen`  → Whether the TaskModal (create task) is visible
 *   - `projectModalOpen` → Whether the ProjectModal (create project) is visible
 *
 * The `<Outlet />` renders whichever page component React Router has matched.
 * The Framer Motion wrapper around `<Outlet />` provides a page-to-page fade+slide transition.
 */
export function AppLayout() {
  /** Controls visibility of the mobile slide-in sidebar drawer */
  const [mobile, setMobile] = useState(false);
  /** Controls visibility of the notification bell dropdown */
  const [notif, setNotif] = useState(false);
  /** Controls visibility of the task creation modal */
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  /** Controls visibility of the project creation modal */
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Read theme and toggle action from global store
  const theme = useAppStore((s) => s.theme);
  const toggle = useAppStore((s) => s.toggleTheme);
  // Notifications used to show unread count badge on the bell button
  const notifications = useAppStore((s) => s.notifications);

  const location = useLocation();

  // Support dynamic project details title
  let currentMeta = routeTitles[location.pathname];
  if (!currentMeta) {
    if (location.pathname.startsWith("/projects/")) {
      currentMeta = {
        title: "Project Workspace",
        subtitle: "Milestones, tasks, and documentation",
      };
    } else {
      currentMeta = {
        title: "Nexus PM",
        subtitle: "Enterprise Project OS",
      };
    }
  }

  return (
    <div className="min-h-dvh">
      <BackgroundBlobs />

      <div className="flex">
        <Sidebar
          open={mobile}
          onClose={() => setMobile(false)}
          onNewTask={() => setTaskModalOpen(true)}
          onNewProject={() => setProjectModalOpen(true)}
        />

        <main className="min-w-0 flex-1 p-3 lg:p-6">
          <header className="glass sticky top-3 z-20 mb-6 flex items-center justify-between gap-3 rounded-3xl px-5 py-3.5 border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation menu"
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setMobile(true)}
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {currentMeta.title}
                </h2>
                <p className="hidden text-xs text-slate-500 sm:block">
                  {currentMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <button
                  aria-label="View notifications"
                  onClick={() => setNotif(!notif)}
                  className="relative rounded-2xl bg-white/80 p-2.5 shadow-xs ring-1 ring-slate-200/70 transition hover:bg-white dark:bg-slate-800/80 dark:ring-white/10 dark:hover:bg-slate-800"
                >
                  <Bell size={18} />
                  {notifications.some((n) => !n.read) && (
                    <motion.span
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 1.3 }}
                      className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
                    />
                  )}
                </button>

                {notif && (
                  <NotificationsDropdown onClose={() => setNotif(false)} />
                )}
              </div>

              <button
                aria-label="Toggle color theme"
                onClick={toggle}
                className="rounded-2xl bg-white/80 p-2.5 shadow-xs ring-1 ring-slate-200/70 transition hover:bg-white dark:bg-slate-800/80 dark:ring-white/10 dark:hover:bg-slate-800"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <Button
                onClick={() => setProjectModalOpen(true)}
                variant="glass"
                className="hidden md:flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold border border-black/10 dark:border-white/10"
              >
                <FolderKanban size={15} />
                <span>New Project</span>
              </Button>

              <Button
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </Button>

              <div className="hidden pl-1 sm:block">
                <Avatar name="KT" />
              </div>
            </div>
          </header>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <ProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </div>
  );
}
