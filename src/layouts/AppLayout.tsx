import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChartNoAxesCombined,
  Command,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { BackgroundBlobs } from '../components/BackgroundBlobs';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { useAppStore } from '../store/useAppStore';
import { useHotkeys } from '../hooks/useHotkeys';
import { CommandPalette } from '../features/CommandPalette';
import { NotificationsDropdown } from '../features/NotificationsDropdown';
import { TaskModal } from '../features/TaskModal';

const links = [
  ['/', 'Dashboard', Home],
  ['/board', 'My Board', LayoutDashboard],
  ['/analytics', 'Analytics', ChartNoAxesCombined],
  ['/settings', 'Settings', Settings],
] as const;

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
            className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : 0 }}
        className={`fixed z-40 flex h-dvh w-72 flex-col p-4 lg:sticky lg:top-0 ${
          open ? 'left-0' : '-left-80 lg:left-0'
        }`}
      >
        <div className="glass flex h-full flex-col rounded-[2rem] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-xl"
              >
                <Zap />
              </motion.div>
              <div>
                <b className="gradient-text text-lg">ProFlow</b>
                <p className="text-xs text-slate-500">personal task manager</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 p-3 text-sm font-bold text-white shadow-lg">
             Personal Workspace <span className="float-right">✨</span>
          </div>

          <nav className="thin-scroll mt-5 flex-1 space-y-1 overflow-y-auto">
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                    isActive ? 'text-white' : 'text-slate-600 hover:bg-white/70 dark:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg"
                      />
                    )}
                    <Icon className="relative" size={18} />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <Button onClick={onNewTask} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            + New Task
          </Button>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/70 p-3 dark:bg-slate-800/70">
            <Avatar name="KT" />
            <div>
              <b className="text-sm">Krishna Teja</b>
              <p className="text-xs text-slate-500">Product Lead</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export function AppLayout() {
  const [mobile, setMobile] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [notif, setNotif] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const theme = useAppStore(s => s.theme);
  const toggle = useAppStore(s => s.toggleTheme);
  const notifications = useAppStore(s => s.notifications);

  const navigate = useNavigate();
  const location = useLocation();

  useHotkeys('k', () => setCmd(true));

  function openTaskModal() {
    setTaskModalOpen(true);
  }

  return (
    <div className="min-h-dvh">
      <BackgroundBlobs />

      <div className="flex">
        <Sidebar open={mobile} onClose={() => setMobile(false)} onNewTask={openTaskModal} />

        <main className="min-w-0 flex-1 p-3 lg:p-6">
          <header className="glass sticky top-3 z-20 mb-6 flex items-center gap-3 rounded-[2rem] p-3">
            <button className="lg:hidden" onClick={() => setMobile(true)}>
              <Menu />
            </button>

            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-xl dark:bg-slate-800/80 dark:ring-slate-700">
            <Search size={18} className="text-slate-400" />

            <input
                aria-label="Search tasks"
                placeholder="Search your tasks..."
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
            />

            <button
                onClick={() => setCmd(true)}
                className="hidden items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-500 shadow-sm transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 sm:flex"
            >
                <Command size={13} />
                <span>K</span>
            </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setNotif(!notif)}
                className="relative rounded-2xl bg-white/70 p-3 shadow dark:bg-slate-800"
              >
                <Bell size={18} />
                {notifications.some(n => !n.read) && (
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 1.3 }}
                    className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500"
                  />
                )}
              </button>

              {notif && <NotificationsDropdown />}
            </div>

            <button onClick={toggle} className="rounded-2xl bg-white/70 p-3 shadow dark:bg-slate-800">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <Button
              onClick={openTaskModal}
              className="hidden bg-gradient-to-r from-indigo-500 to-violet-500 text-white sm:block"
            >
              Quick Add Task
            </Button>

            <Avatar name="KT" />
          </header>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}