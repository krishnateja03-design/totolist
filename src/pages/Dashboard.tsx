/**
 * @file pages/Dashboard.tsx
 * @description ProFlow Home — professional project manager dashboard.
 */
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  Flame,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { ProjectModal } from "../features/ProjectModal";
import { TaskModal } from "../features/TaskModal";
import { Button } from "../components/Button";
import { QuickCreateDropdown } from "../components/QuickCreateDropdown";

const kpiConfig = [
  { grad: "from-indigo-500 to-violet-500", iconBg: "bg-indigo-500" },
  { grad: "from-emerald-500 to-teal-400", iconBg: "bg-emerald-500" },
  { grad: "from-sky-500 to-blue-500", iconBg: "bg-sky-500" },
  { grad: "from-rose-500 to-pink-500", iconBg: "bg-rose-500" },
];

const priorityDot: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-blue-400",
  low: "bg-slate-400",
};

const healthStyles: Record<string, string> = {
  "on-track": "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  "at-risk": "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  "delayed": "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
};

export default function Dashboard() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "done",
  ).length;
  const totalHoursLogged = tasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
  const totalHoursEstimated = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalBudgetSpent = projects.reduce((acc, p) => acc + (p.budget?.spent || 0), 0);
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget?.allocated || 0), 0);
  const budgetPct = Math.min(100, Math.round((totalBudgetSpent / (totalBudget || 1)) * 100));

  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  const kpis: [string, number, LucideIcon, string][] = [
    ["Projects", projects.length, FolderKanban, "active initiatives"],
    ["Completed", completed, CheckCircle2, `${Math.round((completed / (tasks.length || 1)) * 100)}% velocity`],
    ["Hours Logged", Math.round(totalHoursLogged), Clock, `of ${totalHoursEstimated}h estimated`],
    ["Overdue", overdue, Flame, "need attention"],
  ];

  const getHour = new Date().getHours();
  const greeting = getHour < 12 ? "Good morning" : getHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Active
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {greeting}, Workspace Command 👋
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {projects.length === 0
              ? "Welcome to ProFlow. Create your first project to activate sprint tracking."
              : `Tracking ${projects.length} initiatives · ${tasks.length} total work items · ${completed} completed (${Math.round((completed / (tasks.length || 1)) * 100)}% velocity)`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/board">
            <Button
              variant="glass"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-indigo-500" /> Open Sprint Board
            </Button>
          </Link>
          <QuickCreateDropdown
            onNewTask={() => setIsTaskModalOpen(true)}
            onNewProject={() => setIsProjectModalOpen(true)}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map(([label, value, Icon, subtitle], i) => (
          <motion.div
            key={label}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="soft-card rounded-xl p-5 border border-slate-200/70 dark:border-white/8"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              <div className={`grid h-8 w-8 place-items-center rounded-lg ${kpiConfig[i].iconBg} text-white shadow-sm`}>
                <Icon size={14} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              <AnimatedCounter value={value} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-5 xl:grid-cols-5">

        {/* Projects List — 3/5 width */}
        <section className="xl:col-span-3 soft-card rounded-xl border border-slate-200/70 dark:border-white/8 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Projects</h2>
              <p className="text-xs text-slate-400 mt-0.5">{projects.length} initiatives</p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Project Rows */}
          <div className="flex-1 divide-y divide-slate-100 dark:divide-white/5">
            {projects.length === 0 ? (
              <div className="py-12 text-center px-5">
                <FolderKanban className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No projects yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Create your first project to track progress</p>
                <Button
                  onClick={() => setIsProjectModalOpen(true)}
                  variant="glass"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Project
                </Button>
              </div>
            ) : (
              projects.map((project) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id);
                const doneCount = projectTasks.filter((t) => t.status === "done").length;
                const pct = projectTasks.length
                  ? Math.round((doneCount / projectTasks.length) * 100)
                  : 0;

                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/3 transition group"
                  >
                    {/* Color Badge */}
                    <div
                      className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.key.slice(0, 3)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {project.name}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${healthStyles[project.health] ?? ""}`}
                        >
                          {project.health?.replace("-", " ")}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">
                          {pct}%
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {doneCount}/{projectTasks.length} tasks
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <Link
                      to={`/projects/${project.id}`}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      <ArrowUpRight className="h-4 w-4 text-indigo-500" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Budget Footer */}
          {projects.length > 0 && (
            <div className="border-t border-slate-100 dark:border-white/5 px-5 py-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-500">Budget consumed</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  ${(totalBudgetSpent / 1000).toFixed(1)}k / ${(totalBudget / 1000).toFixed(0)}k · {budgetPct}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Upcoming Tasks — 2/5 width */}
        <section className="xl:col-span-2 soft-card rounded-xl border border-slate-200/70 dark:border-white/8 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming</h2>
              <p className="text-xs text-slate-400 mt-0.5">By due date</p>
            </div>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
            >
              All tasks <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Task List */}
          <div className="flex-1 divide-y divide-slate-100 dark:divide-white/5">
            {upcomingTasks.length === 0 ? (
              <div className="py-12 text-center px-5">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-200 dark:text-emerald-900 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No pending tasks.</p>
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isOverdue = new Date(task.dueDate) < new Date();

                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/3 transition"
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot[task.priority] ?? "bg-slate-400"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-snug">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {project && (
                          <span
                            className="text-[10px] font-bold text-white rounded px-1.5 py-0.5 leading-none"
                            style={{ backgroundColor: project.color }}
                          >
                            {project.key}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-medium ${isOverdue ? "text-rose-500" : "text-slate-400"}`}
                        >
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                          {isOverdue && " · Overdue"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Celebrate Footer */}
          <div className="border-t border-slate-100 dark:border-white/5 px-5 py-2.5">
            <button
              onClick={() =>
                confetti({ particleCount: 80, spread: 55, origin: { y: 0.6 } })
              }
              className="w-full text-center text-xs font-medium text-slate-400 hover:text-indigo-500 transition py-0.5"
            >
              🎉 Celebrate a win
            </button>
          </div>
        </section>
      </div>

      {/* Modals */}
      <ProjectModal open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <TaskModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
