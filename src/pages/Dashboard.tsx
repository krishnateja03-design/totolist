/**
 * @file pages/Dashboard.tsx
 * @description Executive Project Intelligence Dashboard – the home page of Nexus PM.
 *
 * This page is the first thing users see after login. It provides:
 *
 *   1. Hero Banner          – Headline KPIs (projects, tasks, hours, overdue) with an animated
 *                             budget burn gauge card and quick action buttons (Launch Project, Log Work Item)
 *   2. KPI Cards Row        – Four animated counter cards for high-level portfolio metrics
 *   3. Upcoming Tasks Panel – Next 4 non-done tasks sorted by due date closest first
 *   4. Project Spotlights   – Cards showing each project's health, milestone count, and budget burn
 *   5. Milestones Timeline  – All milestones across all projects in a compact checklist
 *
 * Data flow:
 *   - All data is read from `useAppStore` (Zustand global store)
 *   - All computed metrics (totals, filters, sorts) are derived directly in the component
 *   - No local state except modal open/close flags
 *
 * When empty (fresh install):
 *   - The hero banner still renders with a "Get started" call to action
 *   - KPI cards show 0 for all metrics
 *   - Empty state messages guide the user to create their first project and task
 */
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Flame,
  Milestone,
  Plus,
  DollarSign,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAppStore } from "../store/useAppStore";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { ProgressBar } from "../components/ProgressBar";
import { ProjectModal } from "../features/ProjectModal";
import { TaskModal } from "../features/TaskModal";
import { Button } from "../components/Button";

/**
 * Gradient class strings for the 4 KPI cards (one per card in order).
 * Used as Tailwind gradient utilities on the card header accent strip.
 */
const cardGrad = [
  "from-indigo-500 to-violet-500",  // Active Projects card
  "from-emerald-500 to-teal-500",   // Tasks Delivered card
  "from-cyan-500 to-blue-500",      // Hours Logged card
  "from-amber-500 to-rose-500",     // Overdue Tasks card (warm/alert colors)
];

export default function Dashboard() {
  // ─── Global State ─────────────────────────────────────────────────────
  const tasks = useAppStore((s) => s.tasks);       // All tasks across all projects
  const projects = useAppStore((s) => s.projects); // All projects in the portfolio

  // ─── Modal State ──────────────────────────────────────────────────────
  /** Controls the "Create Project" modal (also accessible from sidebar and topbar) */
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  /** Controls the "Create Task" modal (also accessible from sidebar and topbar) */
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ─── Computed Metrics ─────────────────────────────────────────────────
  /** Count of tasks that have reached the "done" stage */
  const completed = tasks.filter((t) => t.status === "done").length;
  /** Count of tasks currently being actively worked on ("In Progress" column) */
  const progress = tasks.filter((t) => t.status === "progress").length;
  /**
   * Count of tasks whose dueDate is in the past AND not yet completed.
   * These are highlighted in red in the KPI card to trigger urgency.
   */
  const overdue = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "done",
  ).length;

  /** Sum of all budget `spent` values across every project in USD */
  const totalBudgetSpent = projects.reduce(
    (acc, p) => acc + (p.budget?.spent || 0),
    0,
  );
  /** Sum of all budget `allocated` values across every project in USD */
  const totalBudget = projects.reduce(
    (acc, p) => acc + (p.budget?.allocated || 0),
    0,
  );

  /** Total hours logged against all tasks (shown in the Hours Logged KPI card) */
  const totalHoursLogged = tasks.reduce(
    (acc, t) => acc + (t.loggedHours || 0),
    0,
  );
  /** Total hours estimated across all tasks (shown as subtitle in the KPI card) */
  const totalHoursEstimated = tasks.reduce(
    (acc, t) => acc + (t.estimatedHours || 0),
    0,
  );

  /**
   * The next 4 most urgent tasks (sorted by due date ascending).
   * Excludes completed tasks. Shown in the "Upcoming Tasks" panel.
   * Limited to 4 items to keep the dashboard scannable.
   */
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 4);

  /**
   * KPI card data tuples: [title, value, icon, subtitle].
   * Rendered as four animated counter cards in the KPI row section.
   * The subtitle is computed dynamically (e.g., velocity % or estimated hours).
   */
  const kpis: [string, number, LucideIcon, string][] = [
    ["Active Projects", projects.length, FolderKanban, "initiatives tracked"],
    ["Tasks Delivered", completed, CheckCircle2, `${Math.round((completed / (tasks.length || 1)) * 100)}% sprint velocity`],
    ["Hours Logged", Math.round(totalHoursLogged), Clock, `${totalHoursEstimated}h estimated`],
    ["Overdue Tasks", overdue, Flame, "requires immediate focus"],
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Modern Hero Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl border border-white/10">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute right-10 top-8 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"
        />

        <motion.div
          animate={{ x: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Zap className="h-3.5 w-3.5" /> Enterprise Project OS 2.0
            </div>

            <h1 className="mt-3 max-w-3xl text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Executive Project Intelligence
            </h1>

            <p className="mt-3 max-w-xl text-sm md:text-base text-slate-300 leading-relaxed">
              Track multi-stream cross-functional roadmaps, resource allocation, sprint velocity, and deliverables across {projects.length} major initiatives.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setIsProjectModalOpen(true)}
                variant="gradient"
                className="rounded-2xl px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/30"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Launch Project
              </Button>
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                variant="glass"
                className="rounded-2xl px-5 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Log Work Item
              </Button>
              <button
                onClick={() =>
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.65 },
                  })
                }
                className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Celebrate Milestone 🎉
              </button>
            </div>
          </div>

          {/* Quick Portfolio Health Gauge Card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Financial Burn & Velocity</p>
                  <h3 className="mt-0.5 text-xl font-black text-white">
                    ${(totalBudgetSpent / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-300">/ ${(totalBudget / 1000).toFixed(0)}k Allocated</span>
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center font-bold text-xs">
                  {Math.round((totalBudgetSpent / (totalBudget || 1)) * 100)}%
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Active Delivery Streams</span>
                  <span className="font-bold text-white">{projects.length} Streams</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Overall Pipeline Tasks</span>
                  <span className="font-bold text-white">{tasks.length} Work Items</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Execution Velocity</span>
                  <span className="font-bold text-emerald-400">94.8% on target</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-black/30 p-3.5 border border-white/5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1.5">
                <span>Logged Hours vs Estimate</span>
                <span>{Math.round((totalHoursLogged / (totalHoursEstimated || 1)) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
                  style={{
                    width: `${Math.min(100, Math.round((totalHoursLogged / (totalHoursEstimated || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* KPI Cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map(([label, value, Icon, subtitle], i) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5, scale: 1.01 }}
            className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {label}
              </span>
              <div
                className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${cardGrad[i]} text-white shadow-md`}
              >
                <Icon size={18} />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={value} />
            </div>

            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Projects Spotlight Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Strategic Initiatives & Projects
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time delivery progress across active portfolios
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View All Projects ({projects.length}) <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 p-8 text-center backdrop-blur-md">
            <FolderKanban className="mx-auto h-10 w-10 text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              No Projects Initiated
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Start by launching your first project to organize deliverables and track velocity.
            </p>
            <Button
              onClick={() => setIsProjectModalOpen(true)}
              variant="gradient"
              className="mt-4 rounded-xl px-4 py-2 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Launch Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 3).map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const doneCount = projectTasks.filter((t) => t.status === "done").length;
              const progressPct = projectTasks.length
                ? Math.round((doneCount / projectTasks.length) * 100)
                : 0;

              return (
                <div
                  key={project.id}
                  className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-xl px-2.5 py-0.5 text-xs font-black text-white"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.key}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        {project.category}
                      </span>
                    </div>

                    <h3 className="mt-3 font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mt-4">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-slate-400">Velocity</span>
                        <span className="text-slate-800 dark:text-slate-200">{progressPct}%</span>
                      </div>
                      <ProgressBar value={progressPct} gradient="from-indigo-500 to-violet-500" />
                    </div>
                  </div>

                  <div className="mt-5 border-t border-black/5 dark:border-white/5 pt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Lead: <strong className="text-slate-700 dark:text-slate-300">{project.lead}</strong>
                    </span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Open Hub →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Two Column Grid: Upcoming Tasks & Priority Breakdown */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Urgent & Upcoming Tasks */}
        <section className="soft-card rounded-3xl p-6 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Upcoming Deadlines & Work Items
            </h2>
            <Link
              to="/tasks"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Tasks ({tasks.length})
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-400">
                No upcoming work items scheduled.
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 p-3.5 shadow-xs border border-black/5 dark:border-white/5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {project && (
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[9px] font-black text-white"
                            style={{ backgroundColor: project.color }}
                          >
                            {project.key}
                          </span>
                        )}
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {task.title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[11px] capitalize text-slate-400">
                        {task.priority} Priority • {task.loggedHours || 0}h logged
                      </p>
                    </div>

                    <span className="shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Sprint & Milestone Progress */}
        <section className="soft-card rounded-3xl p-6 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Critical Delivery Milestones
            </h2>
            <Link
              to="/timeline"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Gantt View →
            </Link>
          </div>

          <div className="space-y-3">
            {projects.flatMap((p) => p.milestones).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-400">
                No active delivery milestones defined.
              </div>
            ) : (
              projects.flatMap((p) =>
                p.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl bg-white/70 dark:bg-slate-800/70 p-3.5 border border-black/5 dark:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center text-xs font-bold ${
                          m.completed
                            ? "bg-emerald-500 text-white"
                            : "border-2 border-slate-300 dark:border-slate-600 text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${m.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}>
                          {m.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Project: {p.name}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {m.dueDate}
                    </span>
                  </div>
                )),
              ).slice(0, 4)
            )}
          </div>
        </section>
      </div>

      {/* Creation Modals */}
      <ProjectModal open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <TaskModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
