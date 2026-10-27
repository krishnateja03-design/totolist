/**
 * @file pages/Timeline.tsx
 * @description Gantt-style delivery schedule page showing task duration bars and milestones.
 *
 * This page visualizes when tasks are scheduled relative to a scrollable date window.
 * It is NOT a true SVG Gantt – it uses CSS percentage positioning to render
 * horizontal bars inside a table-like grid of day columns.
 *
 * Features:
 *   - 14-day or 30-day view toggle (current date is always included, 2 days of past context)
 *   - Project filter dropdown (all projects or a single project)
 *   - Task bars positioned using `getTaskPlacement()` – percentage-based left/width
 *   - Milestone markers from the selected project's milestones array
 *   - Priority badge on each task row
 *   - "+" button to add a new task directly from this page
 *
 * Task Bar Placement:
 *   - If a task has a `startDate`, the bar spans from startDate to dueDate
 *   - If no startDate, a default 3-day duration is assumed (dueDate - 3 days)
 *   - Bars are clamped to the visible window so they never overflow the grid
 *   - A minimum width of 8% ensures even 1-day tasks are visible
 *
 * Data flow:
 *   - All tasks and projects read from Zustand store
 *   - `filteredTasks` memoized to avoid refiltering on every date scroll
 *   - `timelineDates` memoized based on the selected span (14 or 30 days)
 */
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Sparkles,
  Milestone as MilestoneIcon,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "../components/Button";
import { TaskModal } from "../features/TaskModal";
import { useAppStore } from "../store/useAppStore";
import { priorityStyles } from "../utils/classNames";

export default function Timeline() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);

  /** Project scope filter: "all" shows all tasks; a project ID shows only that project's tasks */
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  /** Controls the "Add Task" modal visibility */
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  /**
   * The number of days shown in the timeline window.
   * "14" = 2-week view (default), "30" = monthly view.
   */
  const [timelineSpan, setTimelineSpan] = useState<"14" | "30">("14");

  /** Parsed integer version of timelineSpan for use in date math */
  const daysCount = Number(timelineSpan);
  /**
   * Generates the array of Date objects that form the column headers of the timeline.
   * Starts 2 days in the past so users can see recently completed tasks in context.
   * Memoized because date generation is only needed when `daysCount` changes (span toggle).
   */
  const timelineDates = useMemo(() => {
    const list: Date[] = [];
    const base = new Date();
    base.setDate(base.getDate() - 2); // Offset back 2 days for historical context
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, [daysCount]);

  /** The first date in the visible window (used as the left boundary for bar placement) */
  const startDate = timelineDates[0];
  /** The last date in the visible window (used as the right boundary for bar placement) */
  const endDate = timelineDates[timelineDates.length - 1];

  /**
   * Memoized list of tasks filtered by the selected project.
   * Returns all tasks when "all" is selected.
   */
  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return tasks;
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  /**
   * Calculates the CSS left% and width% for a task bar within the timeline window.
   *
   * Algorithm:
   *   1. Determine the task's start timestamp:
   *      - If `taskStartDate` is provided, use it
   *      - Otherwise, default to 3 days before `taskDueDate`
   *   2. Clamp both start and end to the visible window boundaries
   *   3. Convert to percentage positions relative to the window's total duration
   *   4. Apply minimum width of 8% so tiny tasks are still visible
   *   5. Mark as `isOffscreen` if the task falls entirely outside the visible range
   *
   * @param taskDueDate   - ISO date string of the task deadline
   * @param taskStartDate - Optional ISO date string of when work begins
   * @returns Object with `leftPercent`, `widthPercent`, and `isOffscreen` flag
   */
  function getTaskPlacement(taskDueDate: string, taskStartDate?: string) {
    const due = new Date(taskDueDate).getTime();
    const start = taskStartDate
      ? new Date(taskStartDate).getTime()
      : due - 3 * 24 * 60 * 60 * 1000; // default 3 days duration if no startDate

    const windowStart = startDate.getTime();
    const windowEnd = endDate.getTime();
    const totalDuration = windowEnd - windowStart;

    // Clamp task bounds to the visible window to prevent overflow
    const clampedStart = Math.max(windowStart, start);
    const clampedEnd = Math.min(windowEnd, due);

    if (clampedEnd < windowStart || clampedStart > windowEnd) {
      // Task is completely outside the visible date range – render offscreen placeholder
      return { leftPercent: 5, widthPercent: 15, isOffscreen: true };
    }

    // Calculate percentage position within the window
    const leftPercent = ((clampedStart - windowStart) / totalDuration) * 100;
    const widthPercent = Math.max(
      8, // Minimum 8% width so tiny tasks don't disappear
      ((clampedEnd - clampedStart) / totalDuration) * 100,
    );

    return {
      leftPercent: Math.min(90, Math.max(1, leftPercent)), // clamp to 1–90%
      widthPercent: Math.min(95 - leftPercent, widthPercent), // prevent overflow
      isOffscreen: false,
    };
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Clock className="h-3.5 w-3.5" /> Gantt & Milestone Timeline
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Delivery Schedule & Dependencies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualize work timelines, milestone gates, and delivery cadence across projects
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none backdrop-blur-md"
          >
            <option value="all">All Active Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.key} - {p.name}
              </option>
            ))}
          </select>

          {/* Span Switcher */}
          <div className="flex rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setTimelineSpan("14")}
              className={`rounded-xl px-3 py-1 transition-all ${
                timelineSpan === "14"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimelineSpan("30")}
              className={`rounded-xl px-3 py-1 transition-all ${
                timelineSpan === "30"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              30 Days
            </button>
          </div>

          <Button
            onClick={() => setIsTaskModalOpen(true)}
            variant="gradient"
            className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Schedule Task
          </Button>
        </div>
      </div>

      {/* Gantt Interactive Canvas */}
      <div className="overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header Timeline Dates */}
            <div className="grid grid-cols-12 border-b border-black/5 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50">
              <div className="col-span-4 p-4 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-r border-black/5 dark:border-white/10">
                Work Item / Project
              </div>
              <div className="col-span-8 grid grid-flow-col auto-cols-fr divide-x divide-black/5 dark:divide-white/5 py-3">
                {timelineDates.map((d, idx) => {
                  const isToday =
                    d.toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={idx}
                      className={`text-center text-[10px] font-bold ${
                        isToday
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg py-0.5"
                          : "text-slate-400"
                      }`}
                    >
                      <div>
                        {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                      </div>
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Milestone Markers Row */}
            <div className="grid grid-cols-12 border-b border-black/5 dark:border-white/5 bg-indigo-50/30 dark:bg-indigo-950/20 py-2.5 items-center">
              <div className="col-span-4 px-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <MilestoneIcon className="h-3.5 w-3.5" /> Active Milestones
              </div>
              <div className="col-span-8 relative h-7">
                {projects.flatMap((p) =>
                  p.milestones.map((m) => {
                    const place = getTaskPlacement(m.dueDate);
                    return (
                      <div
                        key={m.id}
                        title={`Milestone: ${m.title} (${m.dueDate})`}
                        style={{ left: `${place.leftPercent}%` }}
                        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 -translate-x-1/2 rounded-full border border-indigo-400/40 bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                        <span className="max-w-[80px] truncate">{m.title}</span>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No scheduled work items on this timeline window. Click "Schedule Task" above to add deliverables.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const place = getTaskPlacement(task.dueDate, task.startDate);
                  const isDone = task.status === "done";

                  return (
                    <div
                      key={task.id}
                      className="grid grid-cols-12 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors py-3"
                    >
                      {/* Left Column: Task Name, Project Key, Priority */}
                      <div className="col-span-4 px-4 flex items-center justify-between gap-3 border-r border-black/5 dark:border-white/10">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {project && (
                              <span
                                className="inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-black text-white"
                                style={{ backgroundColor: project.color }}
                              >
                                {project.key}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${priorityStyles[task.priority]}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div className="mt-1 font-bold text-xs text-slate-800 dark:text-white truncate">
                            {task.title}
                          </div>
                        </div>

                        <div className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {task.loggedHours || 0}h / {task.estimatedHours || 4}h
                        </div>
                      </div>

                      {/* Right Column: Interactive Timeline Bar */}
                      <div className="col-span-8 relative h-10 px-2 flex items-center">
                        {/* Grid background reference lines */}
                        <div className="absolute inset-0 grid grid-flow-col auto-cols-fr pointer-events-none opacity-20 divide-x divide-slate-400 dark:divide-slate-600" />

                        {/* Timeline Bar */}
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            left: `${place.leftPercent}%`,
                            width: `${place.widthPercent}%`,
                          }}
                          className={`absolute h-7 rounded-xl flex items-center justify-between px-2.5 text-[10px] font-bold shadow-md cursor-pointer transition-transform hover:scale-102 ${
                            isDone
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                              : project
                                ? "text-white"
                                : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                          }`}
                          title={`${task.title} • ${task.progress}% complete`}
                        >
                          {/* Custom background for project color if not done */}
                          {!isDone && (
                            <div
                              className="absolute inset-0 rounded-xl opacity-90 -z-10"
                              style={{
                                backgroundColor: project?.color || "#6366f1",
                              }}
                            />
                          )}

                          <span className="truncate pr-1">{task.title}</span>
                          <span className="shrink-0 rounded-md bg-black/20 px-1 py-0.2 text-[9px]">
                            {task.progress}%
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
