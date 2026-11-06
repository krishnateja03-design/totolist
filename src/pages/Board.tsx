import { useState, useMemo } from "react";
import { KanbanBoard } from "../features/KanbanBoard";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/Button";
import { TaskModal } from "../features/TaskModal";
import {
  Plus,
  Filter,
  Kanban,
  Folder,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { Priority, Status } from "../types";

export default function Board() {
  const projects = useAppStore((s) => s.projects);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const tasks = useAppStore((s) => s.tasks);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // All tasks matching the project scope
  const projectTasks = useMemo(() => {
    return tasks.filter((t) =>
      selectedProjectId === "all" ? true : t.projectId === selectedProjectId,
    );
  }, [tasks, selectedProjectId]);

  // Sprint metrics for the live sprint bar
  const totalInScope = projectTasks.length;
  const completedCount = projectTasks.filter((t) => t.status === "done").length;
  const inProgressCount = projectTasks.filter((t) => t.status === "progress").length;
  const reviewCount = projectTasks.filter((t) => t.status === "review").length;
  const urgentCount = projectTasks.filter(
    (t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "done",
  ).length;
  const progressPct = Math.round((completedCount / (totalInScope || 1)) * 100);

  return (
    <div className="space-y-4 pb-12">
      {/* ─── Hero Sprint Command Header (Matching Landing Page Preview) ─── */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-black tracking-tight text-white">
                  {activeProject ? activeProject.name : "Engineering Sprint 42"}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sprint 42 Live
                </span>
              </div>
              <p className="mt-0.5 text-xs text-indigo-200/70">
                {activeProject
                  ? `Active sprint for [${activeProject.key}] · ${totalInScope} items tracked`
                  : `Unified multi-initiative pipeline · ${projects.length} connected projects`}
              </p>
            </div>
          </div>

          {/* Quick Sprint Velocity Counters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-indigo-300 font-medium">Throughput:</span>
              <b className="text-white font-bold">{progressPct}%</b>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-emerald-300 font-medium">Done:</span>
              <b className="text-emerald-400 font-bold">{completedCount}</b>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{totalInScope}</span>
            </div>

            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-rose-300 font-semibold backdrop-blur-sm">
                <AlertCircle size={13} />
                <span>{urgentCount} High Priority</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Controls & Filter Bar ─── */}
      <div className="flex flex-col gap-3 rounded-xl soft-card p-3 border border-slate-200/80 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Switcher */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium">
            <Folder className="h-3.5 w-3.5 text-indigo-500" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-semibold cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Quick Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:scale-105"
          >
            <Plus className="h-3.5 w-3.5" /> New Work Item
          </Button>
        </div>
      </div>

      {/* ─── Kanban Board Pipeline ─── */}
      <KanbanBoard
        selectedProjectId={selectedProjectId}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
      />

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
