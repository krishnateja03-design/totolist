import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Folder } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { useAppStore } from "../store/useAppStore";
import { Priority, Status } from "../types";

export function TaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addTask = useAppStore((s) => s.addTask);
  const projects = useAppStore((s) => s.projects);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);

  const [projectId, setProjectId] = useState<string>(
    selectedProjectId !== "all" ? selectedProjectId : projects[0]?.id || "",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("backlog");
  const [assignees, setAssignees] = useState("KT");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [loggedHours, setLoggedHours] = useState(0);
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState(10);
  const [comments, setComments] = useState(0);
  const [attachments, setAttachments] = useState(0);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("backlog");
    setAssignees("KT");
    setDueDate("");
    setEstimatedHours(8);
    setLoggedHours(0);
    setTags("");
    setProgress(10);
    setComments(0);
    setAttachments(0);
  }

  function submit() {
    if (!title.trim()) return;

    addTask({
      projectId: projectId || undefined,
      title: title.trim(),
      description: description.trim() || "No description provided.",
      status,
      priority,
      assignees: assignees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      dueDate: dueDate
        ? new Date(dueDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      estimatedHours: Number(estimatedHours) || 4,
      loggedHours: Number(loggedHours) || 0,
      comments,
      attachments,
      progress,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    resetForm();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/95"
          >
            <div className="mb-5 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create Work Item
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign to a project, track estimated hours, and set target timeline
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Project selector */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Folder className="h-3.5 w-3.5 text-indigo-500" /> Assigned Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-800/80 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">No Project (General Work Item)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Task Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Webhook Dispatcher with exponential backoff"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Scope & Requirements
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical acceptance criteria, user story, API specifications..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-2.5 text-xs font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-800/80 dark:text-white"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="planned">Planned</option>
                    <option value="progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 p-2.5 text-xs font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-800/80 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Assignees (Initials e.g. KT, SK)
                  </label>
                  <input
                    value={assignees}
                    onChange={(e) => setAssignees(e.target.value)}
                    placeholder="KT, AM"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>
              </div>

              {/* Time Tracking Estimates */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" /> Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2 text-sm font-semibold outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" /> Initial Logged Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={loggedHours}
                    onChange={(e) => setLoggedHours(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2 text-sm font-semibold outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tags (Comma separated)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Backend, API, Performance"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Progress
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-black/5 pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={submit}
                  variant="gradient"
                  className="rounded-2xl px-6 py-2.5"
                >
                  Create Work Item
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
