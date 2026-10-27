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
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [timelineSpan, setTimelineSpan] = useState<"14" | "30">("14");

  // Generate date columns for the timeline
  const daysCount = Number(timelineSpan);
  const timelineDates = useMemo(() => {
    const list: Date[] = [];
    const base = new Date();
    base.setDate(base.getDate() - 2); // Start 2 days in the past
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, [daysCount]);

  const startDate = timelineDates[0];
  const endDate = timelineDates[timelineDates.length - 1];

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return tasks;
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // Calculate task bar position and width relative to the timeline window
  function getTaskPlacement(taskDueDate: string, taskStartDate?: string) {
    const due = new Date(taskDueDate).getTime();
    const start = taskStartDate
      ? new Date(taskStartDate).getTime()
      : due - 3 * 24 * 60 * 60 * 1000; // default 3 days duration

    const windowStart = startDate.getTime();
    const windowEnd = endDate.getTime();
    const totalDuration = windowEnd - windowStart;

    const clampedStart = Math.max(windowStart, start);
    const clampedEnd = Math.min(windowEnd, due);

    if (clampedEnd < windowStart || clampedStart > windowEnd) {
      // Offscreen
      return { leftPercent: 5, widthPercent: 15, isOffscreen: true };
    }

    const leftPercent = ((clampedStart - windowStart) / totalDuration) * 100;
    const widthPercent = Math.max(
      8,
      ((clampedEnd - clampedStart) / totalDuration) * 100,
    );

    return {
      leftPercent: Math.min(90, Math.max(1, leftPercent)),
      widthPercent: Math.min(95 - leftPercent, widthPercent),
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
