/**
 * @file layouts/AppLayout.tsx
 * @description The root layout wrapper for all authenticated pages in ProFlow.
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
  X,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import { useAppStore } from "../store/useAppStore";
import { NotificationsDropdown } from "../features/NotificationsDropdown";
import { TaskModal } from "../features/TaskModal";
import { ProjectModal } from "../features/ProjectModal";
import { AuthModal } from "../features/AuthModal";
import { LogIn, LogOut } from "lucide-react";

/**
 * Navigation links rendered in the Sidebar.
 * Each entry is a tuple of [route path, display label, Lucide icon component].
 * The active link is highlighted with a gradient pill via Framer Motion `layoutId`.
 */
const links = [
  ["/", "Home", Home],
  ["/projects", "Projects", FolderKanban],
  ["/board", "Board", LayoutDashboard],
  ["/tasks", "Tasks", ListChecks],
  ["/analytics", "Analytics", ChartNoAxesCombined],
  ["/settings", "Settings", Settings],
] as const;

/**
 * Maps each route pathname to the Topbar title and subtitle.
 * For dynamic routes (e.g., /projects/:id), a fallback is computed in AppLayout.
 * These strings are shown in the sticky header above the page content.
 */
const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Home", subtitle: "Your portfolio overview" },
  "/projects": { title: "Projects", subtitle: "Manage your initiatives" },
  "/board": { title: "Board", subtitle: "Kanban workflow view" },
  "/tasks": { title: "Tasks", subtitle: "All work items" },
  "/analytics": { title: "Analytics", subtitle: "Performance insights" },
  "/settings": { title: "Settings", subtitle: "Workspace configuration" },
};

/**
 * The collapsible left sidebar containing navigation, project switcher, and quick actions.
 * Uses a deep dark indigo sidebar for a professional SaaS look (Notion/Linear/Linear-inspired).
 *
 * On desktop (lg+): Always visible as a sticky sidebar.
 * On mobile (<lg): Hidden off-screen (left: -80) and slides in via an `open` prop.
 *
 * @param open         - Whether the mobile drawer is open
 * @param onClose      - Callback to close the mobile drawer
 * @param onNewTask    - Opens the global TaskModal
 * @param onNewProject - Opens the global ProjectModal
 */
function Sidebar({
  open,
  onClose,
  onNewTask,
  onNewProject,
  onOpenAuth,
}: {
  open: boolean;
  onClose: () => void;
  onNewTask: () => void;
  onNewProject: () => void;
  onOpenAuth: () => void;
}) {
  const projects = useAppStore((s) => s.projects);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : 0 }}
        className={`fixed z-40 flex h-dvh w-64 flex-col lg:sticky lg:top-0 ${
          open ? "left-0" : "-left-72 lg:left-0"
        }`}
      >
        {/* Dark sidebar panel */}
        <div className="sidebar-surface flex h-full flex-col px-3 py-4">

          {/* Logo & Branding */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/30">
                <Layers size={16} className="text-white" />
              </div>
              <div>
                <span className="proflow-logo-text text-base font-black tracking-tight">ProFlow</span>
                <p className="text-[9px] font-medium text-indigo-300/50 leading-none mt-0.5">Project Management</p>
              </div>
            </div>
            <button
              aria-label="Close navigation"
              className="rounded-lg p-1 text-indigo-300/50 hover:bg-white/10 hover:text-white lg:hidden transition"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          {/* Project Scope Switcher */}
          <div className="mx-2 mb-4 rounded-lg bg-white/5 border border-white/8 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300/60">Workspace</span>
              <button
                onClick={onNewProject}
                className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-300/60 hover:text-indigo-200 transition"
                title="Create new project"
              >
                <Plus size={10} /> New
              </button>
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-md bg-white/8 px-2 py-1.5 text-[11px] font-semibold text-indigo-100 outline-none border border-white/10 cursor-pointer"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nav Section Label */}
          <div className="px-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300/40">Navigation</span>
          </div>

          {/* Nav links */}
          <nav className="thin-scroll flex-1 space-y-0.5 overflow-y-auto px-1">
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                    isActive
                      ? "text-white"
                      : "text-indigo-200/60 hover:text-indigo-100 hover:bg-white/6"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-lg bg-indigo-500/25 ring-1 ring-indigo-400/20"
                      />
                    )}
                    <Icon
                      className={`relative shrink-0 ${isActive ? "text-indigo-300" : "text-indigo-300/40"}`}
                      size={15}
                    />
                    <span className="relative">{label}</span>
                    {isActive && (
                      <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* New Task Button */}
          <div className="mx-1 mt-4 mb-3">
            <button
              onClick={onNewTask}
              className="ripple w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 py-2.5 text-[12px] font-semibold text-white shadow-lg shadow-indigo-500/30 transition-colors"
            >
              <Plus size={15} />
              <span>New Task</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-2 border-t border-white/8 mb-3" />

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="mx-1 flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/6 transition group">
              <Avatar name={currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()} />
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[12px] font-semibold text-indigo-100">{currentUser.name}</b>
                <p className="truncate text-[10px] text-indigo-300/50">{currentUser.role || "Project Lead"}</p>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1 rounded text-indigo-300/40 hover:text-rose-400 hover:bg-white/10 transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="mx-1 flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 p-2.5 text-[12px] font-semibold text-white transition"
            >
              <LogIn size={14} className="text-indigo-300" />
              <span>Sign In / Register</span>
            </button>
          )}
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
  /** Controls visibility of the sign in / register modal */
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Read theme and toggle action from global store
  const theme = useAppStore((s) => s.theme);
  const toggle = useAppStore((s) => s.toggleTheme);
  const currentUser = useAppStore((s) => s.currentUser);
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
        title: "ProFlow",
        subtitle: "Professional Project Management",
      };
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-dvh">
      <BackgroundBlobs />

      <div className="flex">
        <Sidebar
          open={mobile}
          onClose={() => setMobile(false)}
          onNewTask={() => setTaskModalOpen(true)}
          onNewProject={() => setProjectModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        <main className="min-w-0 flex-1 p-3 lg:p-5">
          {/* Professional Topbar */}
          <header className="glass sticky top-3 z-20 mb-5 flex items-center justify-between gap-3 rounded-2xl px-5 py-3 border border-white/30 dark:border-white/8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation menu"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 transition"
                onClick={() => setMobile(true)}
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                  {currentMeta.title}
                </h2>
                <p className="hidden text-[11px] text-slate-400 sm:block leading-tight mt-0.5">
                  {currentMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                aria-label="Toggle color theme"
                onClick={toggle}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  aria-label="View notifications"
                  onClick={() => setNotif(!notif)}
                  className="relative rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>

                {notif && (
                  <NotificationsDropdown onClose={() => setNotif(false)} />
                )}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

              {/* New Project */}
              <Button
                onClick={() => setProjectModalOpen(true)}
                variant="glass"
                className="hidden md:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold border border-slate-200 dark:border-slate-700"
              >
                <FolderKanban size={14} />
                <span>New Project</span>
              </Button>

              {/* New Task */}
              <Button
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-md shadow-indigo-500/25 transition-colors"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </Button>

              {/* Avatar / Sign In */}
              {currentUser ? (
                <div className="hidden pl-0.5 sm:block" title={`${currentUser.name} (${currentUser.email})`}>
                  <Avatar name={currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()} />
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <LogIn size={13} className="text-indigo-500" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <ProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
