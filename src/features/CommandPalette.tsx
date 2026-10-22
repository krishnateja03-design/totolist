import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Settings,
  Plus,
  LayoutDashboard,
  ChartNoAxesCombined,
  Users,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { priorityStyles } from "../utils/classNames";

const navigationActions = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, category: "Navigation" },
  { label: "My Board", to: "/board", icon: LayoutDashboard, category: "Navigation" },
  { label: "All Tasks", to: "/tasks", icon: ListChecks, category: "Navigation" },
  { label: "Team", to: "/team", icon: Users, category: "Navigation" },
  { label: "Analytics", to: "/analytics", icon: ChartNoAxesCombined, category: "Navigation" },
  { label: "Settings", to: "/settings", icon: Settings, category: "Navigation" },
];

export function CommandPalette({
  open,
  onClose,
  onOpenNewTask,
}: {
  open: boolean;
  onClose: () => void;
  onOpenNewTask?: () => void;
}) {
  const [query, setQuery] = useState("");
  const nav = useNavigate();
  const tasks = useAppStore((s) => s.tasks);

  const filteredNav = useMemo(() => {
    if (!query.trim()) return navigationActions;
    return navigationActions.filter((a) =>
      a.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const matchedTasks = useMemo(() => {
    if (!query.trim()) return [];
    return tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
      .slice(0, 5);
  }, [query, tasks]);

  function handleClose() {
    setQuery("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start bg-slate-950/40 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/60 p-4 shadow-2xl dark:border-slate-700/60"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-inner ring-1 ring-slate-200/70 dark:bg-slate-800/90 dark:ring-slate-700">
              <Search className="text-slate-400" size={20} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, jump to pages, or type an action..."
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <kbd className="hidden rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300 sm:inline-block">
                ESC
              </kbd>
            </div>

            <div className="thin-scroll mt-3 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {onOpenNewTask && (
                <div>
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenNewTask();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left font-bold transition hover:bg-white/80 dark:hover:bg-slate-800/80"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                      <Plus size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Create new task
                      </p>
                      <p className="text-xs text-slate-400">Add a task to your workspace</p>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">↵</span>
                  </button>
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tasks ({matchedTasks.length})
                  </p>
                  <div className="mt-1 space-y-1">
                    {matchedTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          nav("/tasks");
                          handleClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left transition hover:bg-white/80 dark:hover:bg-slate-800/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <CheckCircle2 size={16} />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {t.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              Status: <span className="capitalize">{t.status}</span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${priorityStyles[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredNav.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Navigation
                  </p>
                  <div className="mt-1 space-y-1">
                    {filteredNav.map(({ label, to, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => {
                          nav(to);
                          handleClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl p-3 text-left font-bold transition hover:bg-white/80 dark:hover:bg-slate-800/80"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                          <Icon size={16} />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                          {label}
                        </span>
                        <span className="ml-auto text-xs text-slate-400">Jump ↵</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedTasks.length === 0 && filteredNav.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No tasks or pages matching &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
