import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  FolderKanban,
  Kanban,
  ListTodo,
  Milestone as MilestoneIcon,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../features/TaskModal";
import { useAppStore } from "../store/useAppStore";
import { ProjectHealth } from "../types";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const toggleMilestone = useAppStore((s) => s.toggleMilestone);
  const addMilestone = useAppStore((s) => s.addMilestone);
  const addProjectNote = useAppStore((s) => s.addProjectNote);
  const updateProject = useAppStore((s) => s.updateProject);

  const [activeTab, setActiveTab] = useState<"tasks" | "milestones" | "notes" | "activity">("tasks");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderKanban className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Project Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The project you are looking for may have been archived or deleted.</p>
        <Link to="/projects" className="mt-6">
          <Button variant="gradient">Return to Projects Portfolio</Button>
        </Link>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const doneTasks = projectTasks.filter((t) => t.status === "done");
  const inProgressTasks = projectTasks.filter((t) => t.status === "progress");
  const progress = projectTasks.length
    ? Math.round((doneTasks.length / projectTasks.length) * 100)
    : 0;

  const totalLogged = projectTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
  const totalEstimated = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !id) return;
    addMilestone(id, {
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDate || new Date().toISOString().split("T")[0],
      completed: false,
    });
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !id) return;
    addProjectNote(id, {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      author: "Krishna Teja",
    });
    setNoteTitle("");
    setNoteContent("");
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Projects
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/board"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Kanban className="h-3.5 w-3.5 text-indigo-500" /> Open in Kanban
          </Link>
          <Link
            to="/timeline"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Clock className="h-3.5 w-3.5 text-emerald-500" /> Open in Gantt Timeline
          </Link>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div
          className="absolute -top-24 right-0 h-72 w-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: project.color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-black text-white shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                {project.key}
              </span>
              <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                {project.category}
              </span>
              <span className="rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                ● {project.health.replace("-", " ")}
              </span>
              <span className="rounded-xl bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                Status: {project.status}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {project.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-indigo-500" /> Lead: <strong className="text-slate-800 dark:text-slate-200">{project.lead}</strong>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Target: <strong className="text-slate-800 dark:text-slate-200">{project.targetDate}</strong>
              </span>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-black/5 dark:border-white/5 min-w-[240px]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Overall Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
            </div>
            <ProgressBar value={progress} gradient="from-indigo-500 to-cyan-500" />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Time Spent</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {totalLogged}h <span className="text-[10px] text-slate-400">/ {totalEstimated}h</span>
                </div>
              </div>
              {project.budget && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Budget Spent</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    ${(project.budget.spent / 1000).toFixed(1)}k
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setIsTaskModalOpen(true)}
              variant="gradient"
              className="w-full justify-center gap-2 rounded-xl py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Project Task
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-2">
          {[
            { id: "tasks", label: `Tasks (${projectTasks.length})`, icon: ListTodo },
            { id: "milestones", label: `Milestones (${project.milestones.length})`, icon: MilestoneIcon },
            { id: "notes", label: `Docs & Notes (${project.notes?.length || 0})`, icon: FileText },
            { id: "activity", label: `Activity (${project.activity?.length || 0})`, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Tasks View */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Work Items assigned to this Project
            </h3>
            <span className="text-xs text-slate-500">
              {doneTasks.length} Completed • {inProgressTasks.length} In Progress
            </span>
          </div>

          {projectTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <ListTodo className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h4 className="font-bold text-slate-800 dark:text-white">No tasks created yet</h4>
              <p className="mt-1 text-xs text-slate-500">Break down project outcomes into tangible work items.</p>
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                variant="gradient"
                className="mt-4 rounded-xl px-4 py-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Create First Task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Milestones View */}
      {activeTab === "milestones" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Strategic Milestones & Deliverables
            </h3>

            <div className="space-y-2.5">
              {project.milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMilestone(project.id, m.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                    m.completed
                      ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${
                        m.completed
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-slate-300 dark:border-slate-600 text-transparent"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div
                        className={`text-sm font-bold ${
                          m.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {m.title}
                      </div>
                      <div className="text-xs text-slate-400">Target Date: {m.dueDate}</div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      m.completed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {m.completed ? "Achieved" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Milestone Form */}
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md h-fit">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Add New Milestone
            </h4>
            <form onSubmit={handleAddMilestone} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Stakeholder sign-off on API spec"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Target Date</label>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white outline-none"
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full justify-center rounded-xl py-2 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Milestone
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Notes & Architecture Docs */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Project Architecture & Meeting Notes
            </h3>

            {!project.notes || project.notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs text-slate-400">
                No notes or documentation written yet. Use the composer on the right to add design docs.
              </div>
            ) : (
              <div className="space-y-3">
                {project.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {note.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {note.author} • {note.updatedAt}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Note Card */}
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md h-fit">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Write New Document / Note
            </h4>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Doc Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Database Migration Protocol"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400">Content / Markdown</label>
                <textarea
                  required
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record decisions, technical trade-offs, and meeting takeaways..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full justify-center rounded-xl py-2 text-xs">
                <Send className="h-3.5 w-3.5 mr-1" /> Publish Document
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Activity Stream */}
      {activeTab === "activity" && (
        <div className="max-w-2xl rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Audit Trail & Project Activity
          </h3>

          {!project.activity || project.activity.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No recorded activity yet.
            </div>
          ) : (
            <div className="space-y-4">
              {project.activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {act.user.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-slate-800 dark:text-slate-200">
                      <strong>{act.user}</strong> {act.action}{" "}
                      {act.details && <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{act.details}"</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
