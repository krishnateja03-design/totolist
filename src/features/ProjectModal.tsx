import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FolderPlus,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  Flag,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { useAppStore } from "../store/useAppStore";
import { ProjectCategory, ProjectHealth } from "../types";

const colorPresets = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#ef4444", // Red
];

const categoryOptions: ProjectCategory[] = [
  "Product",
  "Engineering",
  "Marketing",
  "Design",
  "Operations",
];

const healthOptions: { value: ProjectHealth; label: string; dot: string }[] = [
  { value: "on-track", label: "On Track", dot: "bg-emerald-500" },
  { value: "at-risk", label: "At Risk", dot: "bg-amber-500" },
  { value: "delayed", label: "Delayed", dot: "bg-rose-500" },
];

export function ProjectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addProject = useAppStore((s) => s.addProject);

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("Product");
  const [health, setHealth] = useState<ProjectHealth>("on-track");
  const [status, setStatus] = useState<"active" | "planning" | "completed" | "on-hold">("active");
  const [lead, setLead] = useState("Krishna Teja");
  const [color, setColor] = useState(colorPresets[0]);
  const [targetDays, setTargetDays] = useState(30);
  const [budgetAllocated, setBudgetAllocated] = useState("25000");
  const [initialMilestone, setInitialMilestone] = useState("Architecture Design & Kickoff");

  function handleNameChange(val: string) {
    setName(val);
    if (!key || key.length <= 4) {
      const generated = val
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);
      if (generated) setKey(generated);
    }
  }

  function resetForm() {
    setName("");
    setKey("");
    setDescription("");
    setCategory("Product");
    setHealth("on-track");
    setStatus("active");
    setColor(colorPresets[0]);
    setBudgetAllocated("25000");
    setInitialMilestone("Architecture Design & Kickoff");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + Number(targetDays || 30));

    const allocated = Number(budgetAllocated) || 0;

    addProject({
      name: name.trim(),
      key: key.trim().toUpperCase() || "PRJ",
      description: description.trim() || "Multi-disciplinary team initiative.",
      color,
      icon: "Folder",
      category,
      health,
      status,
      lead,
      startDate: now.toISOString().split("T")[0],
      targetDate: targetDate.toISOString().split("T")[0],
      budget: {
        allocated,
        spent: 0,
      },
      milestones: initialMilestone.trim()
        ? [
            {
              id: `m-${Date.now()}`,
              title: initialMilestone.trim(),
              dueDate: targetDate.toISOString().split("T")[0],
              completed: false,
            },
          ]
        : [],
      notes: [],
    });

    resetForm();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/95 max-h-[92vh] overflow-y-auto"
          >
            {/* Header Accent Glow */}
            <div
              className="absolute -top-24 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl pointer-events-none"
              style={{ backgroundColor: color }}
            />

            <div className="relative flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg shadow-indigo-500/20"
                  style={{ backgroundColor: color }}
                >
                  <FolderPlus className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Create New Project
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define scope, timeline, budget, and strategic goals
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="relative mt-5 space-y-4">
              {/* Project Name & Key */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. NextGen Mobile Banking SDK"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Key / Prefix
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    placeholder="SDK"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-3 py-2.5 text-center text-sm font-bold tracking-wider text-indigo-600 uppercase focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-indigo-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mission & Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Primary outcomes, deliverables, and architecture considerations..."
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              {/* Category, Status, Health */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-slate-800/80 dark:text-white"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Flag className="h-3.5 w-3.5 text-emerald-500" /> Health
                  </label>
                  <select
                    value={health}
                    onChange={(e) => setHealth(e.target.value as ProjectHealth)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-slate-800/80 dark:text-white"
                  >
                    {healthOptions.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lead
                  </label>
                  <input
                    type="text"
                    value={lead}
                    onChange={(e) => setLead(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs font-medium text-slate-800 dark:border-white/10 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              {/* Budget & Target Days */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Total Budget ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={budgetAllocated}
                    onChange={(e) => setBudgetAllocated(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Target Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>
              </div>

              {/* Initial Milestone */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> First Key Milestone
                </label>
                <input
                  type="text"
                  value={initialMilestone}
                  onChange={(e) => setInitialMilestone(e.target.value)}
                  placeholder="e.g. Prototype demonstration to stakeholders"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2 text-xs font-medium text-slate-900 dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              {/* Project Color Badge Picker */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Project Brand Color
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        color === c
                          ? "ring-4 ring-offset-2 scale-110 ring-indigo-500 dark:ring-offset-slate-900"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-black/5 pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" variant="gradient" className="rounded-2xl px-6 py-2.5">
                  Launch Project
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
