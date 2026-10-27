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
  FolderKanban,
  Clock,
  Folder,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { priorityStyles } from "../utils/classNames";

const navigationActions = [
  { label: "Executive Dashboard", to: "/", icon: LayoutDashboard, category: "Navigation" },
  { label: "Projects Portfolio", to: "/projects", icon: FolderKanban, category: "Navigation" },
  { label: "Gantt Timeline", to: "/timeline", icon: Clock, category: "Navigation" },
  { label: "Workflow Board", to: "/board", icon: LayoutDashboard, category: "Navigation" },
  { label: "All Work Items", to: "/tasks", icon: ListChecks, category: "Navigation" },
  { label: "Team & Capacity", to: "/team", icon: Users, category: "Navigation" },
  { label: "Analytics & Telemetry", to: "/analytics", icon: ChartNoAxesCombined, category: "Navigation" },
  { label: "Platform Settings", to: "/settings", icon: Settings, category: "Navigation" },
];

export function CommandPalette({
  open,
  onClose,
  onOpenNewTask,
  onOpenNewProject,
}: {
  open: boolean;
  onClose: () => void;
  onOpenNewTask?: () => void;
  onOpenNewProject?: () => void;
}) {
  const [query, setQuery] = useState("");
  const nav = useNavigate();
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  const filteredNav = useMemo(() => {
    if (!query.trim()) return navigationActions;
    return navigationActions.filter((a) =>
      a.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const matchedProjects = useMemo(() => {
    if (!query.trim()) return projects.slice(0, 3);
    return projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.key.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 4);
  }, [query, projects]);

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
          className="fixed inset-0 z-50 grid place-items-start bg-slate-950/50 p-4 pt-[10vh] backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/60 p-4 shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/90"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-inner ring-1 ring-slate-200/70 dark:bg-slate-800/90 dark:ring-slate-700">
              <Search className="text-slate-400" size={20} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tasks, or jump directly to pages..."
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <kbd className="hidden rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300 sm:inline-block">
                ESC
              </kbd>
            </div>

            <div className="thin-scroll mt-3 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onOpenNewTask && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenNewTask();
                    }}
                    className="flex items-center gap-3 rounded-2xl p-2.5 text-left font-bold transition hover:bg-white/80 dark:hover:bg-slate-800/80 border border-black/5 dark:border-white/5"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                      <Plus size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        Create Work Item
                      </p>
                      <p className="text-[10px] text-slate-400">Add to project pipeline</p>
                    </div>
                  </button>
                )}

                {onOpenNewProject && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenNewProject();
                    }}
                    className="flex items-center gap-3 rounded-2xl p-2.5 text-left font-bold transition hover:bg-white/80 dark:hover:bg-slate-800/80 border border-black/5 dark:border-white/5"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                      <FolderKanban size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        Launch New Project
                      </p>
                      <p className="text-[10px] text-slate-400">Define scope & milestones</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Matched Projects */}
              {matchedProjects.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Projects ({matchedProjects.length})
                  </p>
                  <div className="mt-1 space-y-1">
                    {matchedProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProject(p.id);
                          nav(`/projects/${p.id}`);
                          handleClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 text-left transition hover:bg-white/80 dark:hover:bg-slate-800/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="inline-flex rounded-lg px-2 py-0.5 text-xs font-black text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.key}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Lead: {p.lead} • {p.category}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-500">
                          Open Hub →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Tasks */}
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
                        className="flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 text-left transition hover:bg-white/80 dark:hover:bg-slate-800/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <CheckCircle2 size={14} />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Status: <span className="capitalize">{t.status}</span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyles[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {filteredNav.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Navigation
                  </p>
                  <div className="mt-1 space-y-1">
                    {filteredNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.to}
                          onClick={() => {
                            nav(item.to);
                            handleClose();
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-white/80 dark:hover:bg-slate-800/80"
                        >
                          <Icon size={16} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
