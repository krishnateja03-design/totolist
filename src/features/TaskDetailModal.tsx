import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Send,
  MessageSquare,
  ListTodo,
  AlertCircle,
  Tag,
  Trash2,
  Folder,
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Task, Priority, Status, TaskSubtask, TaskComment } from "../types";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

const priorityStyles: Record<Priority, { text: string; bg: string }> = {
  urgent: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" },
  high: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  medium: { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  low: { text: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
};

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const addTaskComment = useAppStore((s) => s.addTaskComment);
  const addSubtask = useAppStore((s) => s.addSubtask);
  const toggleSubtask = useAppStore((s) => s.toggleSubtask);
  const moveTask = useAppStore((s) => s.moveTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [commentText, setCommentText] = useState("");
  const [subtaskText, setSubtaskText] = useState("");

  const task = tasks.find((t) => t.id === taskId);
  const project = projects.find((p) => p.id === task?.projectId);

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !taskId) return;
    addTaskComment(taskId, commentText.trim());
    setCommentText("");
  }

  function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!subtaskText.trim() || !taskId) return;
    addSubtask(taskId, subtaskText.trim());
    setSubtaskText("");
  }

  const subtasks: TaskSubtask[] = Array.isArray(task?.subtasks)
    ? task.subtasks
    : typeof task?.subtasks === "string"
      ? (() => {
          try {
            return JSON.parse(task.subtasks);
          } catch {
            return [];
          }
        })()
      : [];

  const completedSubtasks = subtasks.filter((s) => s && s.completed).length;

  const comments: TaskComment[] = Array.isArray(task?.commentsList)
    ? task.commentsList
    : typeof task?.commentsList === "string"
      ? (() => {
          try {
            return JSON.parse(task.commentsList);
          } catch {
            return [];
          }
        })()
      : [];

  const priorityInfo = task && priorityStyles[task.priority] ? priorityStyles[task.priority] : priorityStyles.medium;

  return (
    <AnimatePresence>
      {task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-white/10 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/8 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                {project && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.key}
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">#{task.id}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    priorityInfo.bg
                  } ${priorityInfo.text}`}
                >
                  {task.priority || "medium"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (window.confirm("Delete this work item?")) {
                      deleteTask(task.id);
                      onClose();
                    }
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title & Description */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {task.title}
                </h2>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {task.description || "No description provided for this work item."}
                </p>
              </div>

              {/* Quick Meta Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 text-xs">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</span>
                  <select
                    value={task.status}
                    onChange={(e) => moveTask(task.id, e.target.value as Status)}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="planned">Planned</option>
                    <option value="progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Due Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 py-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    {task.dueDate}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Logged Time</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 py-1 flex items-center gap-1.5">
                    <Clock size={13} className="text-indigo-400" />
                    {task.loggedHours || 0} / {task.estimatedHours || 0}h
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Assignees</span>
                  <div className="flex -space-x-1 py-0.5">
                    {(task.assignees || []).length > 0 ? (
                      task.assignees.map((a, i) => (
                        <Avatar key={i} name={a} />
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Subtasks Checklist ─── */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ListTodo size={14} className="text-indigo-500" />
                    Subtasks Checklist ({completedSubtasks}/{subtasks.length})
                  </h3>
                </div>

                {/* Checklist items */}
                <div className="space-y-1.5">
                  {subtasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No checklist items yet.</p>
                  ) : (
                    subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtask(task.id, st.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                          st.completed
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-slate-400 line-through"
                            : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-white/8 text-slate-800 dark:text-slate-200 hover:border-indigo-400"
                        }`}
                      >
                        {st.completed ? (
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Circle size={15} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span className="text-xs font-medium select-none">{st.title}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Subtask input */}
                <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={subtaskText}
                    onChange={(e) => setSubtaskText(e.target.value)}
                    placeholder="Add checklist item..."
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="submit"
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                  >
                    <Plus size={13} />
                  </Button>
                </form>
              </div>

              {/* ─── Comments & Discussion ─── */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-violet-500" />
                  Comments & Discussion ({comments.length})
                </h3>

                {/* Comments feed */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments yet.</p>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">{c.author}</span>
                          <span className="text-slate-400">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Post comment input */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="submit"
                    className="rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs flex items-center gap-1"
                  >
                    <Send size={12} />
                    <span>Post</span>
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

