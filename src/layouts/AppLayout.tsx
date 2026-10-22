import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChartNoAxesCombined,
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
} from "lucide-react";
import { useState } from "react";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import { useAppStore } from "../store/useAppStore";
import { NotificationsDropdown } from "../features/NotificationsDropdown";
import { TaskModal } from "../features/TaskModal";

const links = [
  ["/", "Dashboard", Home],
  ["/board", "My Board", LayoutDashboard],
  ["/tasks", "All Tasks", ListChecks],
  ["/team", "Team", Users],
  ["/analytics", "Analytics", ChartNoAxesCombined],
  ["/settings", "Settings", Settings],
] as const;

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Overview & personal progress" },
  "/board": { title: "Kanban Board", subtitle: "Visual workflow pipeline" },
  "/tasks": { title: "Task Manager", subtitle: "Search, filter & bulk actions" },
  "/team": { title: "Team Members", subtitle: "Workload distribution & status" },
  "/analytics": { title: "Analytics", subtitle: "Performance metrics & insights" },
  "/settings": { title: "Settings", subtitle: "Preferences & data persistence" },
};

function Sidebar({
  open,
  onClose,
  onNewTask,
}: {
  open: boolean;
  onClose: () => void;
  onNewTask: () => void;
}) {
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
        <div className="glass flex h-full flex-col rounded-[2rem] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-xl"
              >
                <Zap size={22} />
              </motion.div>
              <div>
                <b className="gradient-text text-xl font-black">ProFlow</b>
                <p className="text-xs text-slate-500">task & workflow suite</p>
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

          <div className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 p-3 text-sm font-bold text-white shadow-lg">
            Personal Workspace <span className="float-right">✨</span>
          </div>

          <nav className="thin-scroll mt-5 flex-1 space-y-1.5 overflow-y-auto">
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
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
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25"
                      />
                    )}
                    <Icon className="relative" size={18} />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <Button
            onClick={onNewTask}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/25"
          >
            <Plus size={18} />
            <span>New Task</span>
          </Button>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-800/70">
            <Avatar name="KT" />
            <div className="min-w-0 flex-1">
              <b className="block truncate text-sm">Krishna Teja</b>
              <p className="truncate text-xs text-slate-500">Workspace Admin</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export function AppLayout() {
  const [mobile, setMobile] = useState(false);
  const [notif, setNotif] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const theme = useAppStore((s) => s.theme);
  const toggle = useAppStore((s) => s.toggleTheme);
  const notifications = useAppStore((s) => s.notifications);

  const location = useLocation();
  const currentMeta = routeTitles[location.pathname] || {
    title: "ProFlow",
    subtitle: "Personal workspace",
  };

  return (
    <div className="min-h-dvh">
      <BackgroundBlobs />

      <div className="flex">
        <Sidebar
          open={mobile}
          onClose={() => setMobile(false)}
          onNewTask={() => setTaskModalOpen(true)}
        />

        <main className="min-w-0 flex-1 p-3 lg:p-6">
          <header className="glass sticky top-3 z-20 mb-6 flex items-center justify-between gap-3 rounded-[2rem] px-5 py-3.5">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation menu"
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setMobile(true)}
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
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
                  className="relative rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-white dark:bg-slate-800/80 dark:ring-slate-700 dark:hover:bg-slate-800"
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
                className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-white dark:bg-slate-800/80 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <Button
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-indigo-500/25"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Task</span>
              </Button>

              <div className="hidden pl-1 sm:block">
                <Avatar name="KT" />
              </div>
            </div>
          </header>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}
