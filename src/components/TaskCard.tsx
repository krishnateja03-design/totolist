/**
 * @file components/TaskCard.tsx
 * @description Kanban board task card component with project badge, progress bar,
 *              time tracking, assignee avatars, and an inline "Log Time" popover.
 *
 * This card is used in two contexts:
 *   1. The KanbanBoard – rendered inside each droppable column
 *   2. (Optionally) any list view that needs a card representation
 *
 * Features:
 *   - Priority badge (color-coded: low/medium/high/urgent)
 *   - Project key badge (colored dot with the project's hex color)
 *   - Task title + description (clamped to 2 lines each)
 *   - Completion progress bar (0–100%)
 *   - Tag chips (up to 3 shown)
 *   - Inline "Log Time" popover to add hours directly from the card
 *   - Assignee avatars stacked horizontally
 *   - Due date, comment count, and attachment count in the footer
 *   - Delete button (visible on hover via CSS group-hover)
 *
 * Animation:
 *   - Framer Motion `layout` prop handles smooth reordering when tasks move columns
 *   - `whileHover` lifts the card slightly for a tactile feel
 */

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

/**
 * TaskCard component — renders a single task as a drag-and-drop card.
 *
 * @param task - The Task object from the global store to display
 */
export function TaskCard({ task }: { task: Task }) {
  // ─── Store Actions ──────────────────────────────────────────────────────
  const del = useAppStore((s) => s.deleteTask);       // Action to permanently remove this task
  const logHours = useAppStore((s) => s.logTaskHours); // Action to increment logged hours
  const projects = useAppStore((s) => s.projects);    // All projects (to find this task's project)

  // ─── Local UI State ─────────────────────────────────────────────────────
  /** Controls visibility of the inline "Log Time" popover */
  const [showLogModal, setShowLogModal] = useState(false);
  /** The number of hours the user wants to log; bound to the popover input */
  const [hoursToAdd, setHoursToAdd] = useState(1);

  // Find the parent project by projectId so we can show its color badge
  const project = projects.find((p) => p.id === task.projectId);

  /**
   * Handles the "Save" button click inside the Log Time popover.
   * Uses `e.stopPropagation()` to prevent triggering any parent drag handlers.
   */
  function handleLogTime(e: React.MouseEvent) {
    e.stopPropagation(); // Prevent DnD drag activation
    logHours(task.id, hoursToAdd);
    setShowLogModal(false); // Close the popover after saving
  }

  return (
    <motion.div
      layout // Animates position changes when tasks move between columns
      whileHover={{ scale: 1.015, y: -3 }} // Subtle lift on hover for tactile feedback
      className="soft-card group relative rounded-3xl p-4 transition-all duration-200 border border-black/5 dark:border-white/10"
    >
      {/* ── Card Header: Priority + Project Badge + Title + Delete Button ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Priority and project badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority badge – color determined by priorityStyles utility */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[task.priority]}`}
            >
              {task.priority}
            </span>

            {/* Project key badge – only shown if task belongs to a project */}
            {project && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: project.color }} // Uses project's hex color
              >
                {project.key}
              </span>
            )}
          </div>

          {/* Task title – clamped to 2 lines to maintain card height consistency */}
          <h3 className="mt-2.5 font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {task.title}
          </h3>
          {/* Task description – also clamped to 2 lines */}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Delete button – hidden until card is hovered (group-hover opacity trick) */}
        <button
          aria-label="Delete task"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag from activating during delete click
            del(task.id);
          }}
          className="rounded-xl p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* ── Completion Progress Bar ───────────────────────────────────────── */}
      <div className="mt-3.5">
        {/* Label row: "Completion" on the left, percentage on the right */}
        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1">
          <span>Completion</span>
          <span className="text-slate-700 dark:text-slate-300">{task.progress}%</span>
        </div>
        {/* Animated progress bar – auto-fills to 100% when task is moved to "done" */}
        <ProgressBar
          value={task.progress}
          gradient="from-cyan-500 to-indigo-500"
        />
      </div>

      {/* ── Tags + Time Tracking Row ──────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3 dark:border-white/5">
        {/* Tag chips – shows up to 3 tags, prefixed with # */}
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

        {/* ── Inline Time Logger ─────────────────────────────────────────── */}
        {/* Shows "Xh / Yh" (logged / estimated) and opens a popover to add hours */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLogModal(!showLogModal); // Toggle popover visibility
            }}
            title="Click to log work hours"
            className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <Clock size={11} />
            {/* Display format: "loggedHours / estimatedHours" */}
            <span>{task.loggedHours || 0}h / {task.estimatedHours || 4}h</span>
            <Plus size={10} className="ml-0.5" />
          </button>

          {/* Quick hour logger popover – appears above the button when open */}
          {showLogModal && (
            <div
              onClick={(e) => e.stopPropagation()} // Prevent DnD interference
              className="absolute bottom-full right-0 mb-2 z-20 w-44 rounded-2xl border border-white/20 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-900"
            >
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Log Time Worked
              </div>
              <div className="flex items-center gap-2">
                {/* Hour input – accepts decimals (e.g., 0.5h = 30 min) */}
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
                {/* Save button calls handleLogTime which dispatches to the store */}
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

      {/* ── Card Footer: Assignees + Due Date + Comments + Attachments ─────── */}
      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
        {/* Stacked assignee avatars – -space-x-1.5 creates the overlap effect */}
        <div className="flex -space-x-1.5">
          {task.assignees.map((a) => (
            <Avatar key={a} name={a} />
          ))}
        </div>

        {/* Metadata row: due date, comment count, attachment count */}
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
          {/* Due date formatted as "Jan 15" style */}
          <span className="flex items-center gap-1">
            <CalendarDays size={13} />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          {/* Comment count – currently a display counter; real comment threading is future scope */}
          <span className="flex items-center gap-1">
            <MessageCircle size={13} />
            {task.comments}
          </span>
          {/* Attachment count – currently a counter; file upload is future scope */}
          <span className="flex items-center gap-1">
            <Paperclip size={13} />
            {task.attachments}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
