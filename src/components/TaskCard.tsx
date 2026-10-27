import { motion } from "framer-motion";
import {
  MessageCircle,
  Paperclip,
  CalendarDays,
  Trash2,
  Clock,
  Plus,
} from "lucide-react";
import { Task } from "../types";
import { priorityStyles } from "../utils/classNames";
import { Avatar } from "./Avatar";
import { ProgressBar } from "./ProgressBar";
import { useAppStore } from "../store/useAppStore";
import { useState } from "react";

export function TaskCard({ task }: { task: Task }) {
  const del = useAppStore((s) => s.deleteTask);
  const logHours = useAppStore((s) => s.logTaskHours);
  const projects = useAppStore((s) => s.projects);
  const [showLogModal, setShowLogModal] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState(1);

  const project = projects.find((p) => p.id === task.projectId);

  function handleLogTime(e: React.MouseEvent) {
    e.stopPropagation();
    logHours(task.id, hoursToAdd);
    setShowLogModal(false);
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.015, y: -3 }}
      className="soft-card group relative rounded-3xl p-4 transition-all duration-200 border border-black/5 dark:border-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[task.priority]}`}
            >
              {task.priority}
            </span>

            {project && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: project.color }}
              >
                {project.key}
              </span>
            )}
          </div>

          <h3 className="mt-2.5 font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {task.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        <button
          aria-label="Delete task"
          onClick={(e) => {
            e.stopPropagation();
            del(task.id);
          }}
          className="rounded-xl p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-3.5">
        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1">
          <span>Completion</span>
          <span className="text-slate-700 dark:text-slate-300">{task.progress}%</span>
        </div>
        <ProgressBar
          value={task.progress}
          gradient="from-cyan-500 to-indigo-500"
        />
      </div>

      {/* Tags and Time stats */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3 dark:border-white/5">
        <div className="flex flex-wrap gap-1.5">
          {task.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Logged / Estimated hours pill */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLogModal(!showLogModal);
            }}
            title="Click to log work hours"
            className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <Clock size={11} />
            <span>{task.loggedHours || 0}h / {task.estimatedHours || 4}h</span>
            <Plus size={10} className="ml-0.5" />
          </button>

          {/* Quick hour logger popover */}
          {showLogModal && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full right-0 mb-2 z-20 w-44 rounded-2xl border border-white/20 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-900"
            >
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Log Time Worked
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(Number(e.target.value))}
                  className="w-16 rounded-xl border border-slate-200 px-2 py-1 text-xs font-bold text-center dark:border-white/10 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-xs text-slate-400">hours</span>
              </div>
              <div className="mt-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogTime}
                  className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
        <div className="flex -space-x-1.5">
          {task.assignees.map((a) => (
            <Avatar key={a} name={a} />
          ))}
        </div>
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarDays size={13} />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} />
            {task.comments}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip size={13} />
            {task.attachments}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
