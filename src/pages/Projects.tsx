import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  Target,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { ProjectModal } from "../features/ProjectModal";
import { useAppStore } from "../store/useAppStore";
import { Project, ProjectCategory, ProjectHealth } from "../types";

const healthBadgeStyles: Record<ProjectHealth, { label: string; bg: string; text: string; dot: string }> = {
  "on-track": {
    label: "On Track",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  "at-risk": {
    label: "At Risk",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  delayed: {
    label: "Delayed",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

export default function Projects() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lead.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchHealth =
        healthFilter === "all" || p.health === healthFilter;

      return matchQuery && matchCategory && matchHealth;
    });
  }, [projects, searchQuery, categoryFilter, healthFilter]);

  // Aggregate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overallTaskProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-indigo-300">
              <FolderKanban className="h-3.5 w-3.5" /> Project Portfolio Hub
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Enterprise Project Management
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Coordinate multi-disciplinary teams, track deliverables, monitor budgets, and accelerate product velocity across initiatives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="gradient"
              className="flex items-center gap-2 rounded-2xl px-5 py-3 shadow-xl shadow-indigo-500/25"
            >
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </div>
        </div>

        {/* Portfolio KPI Bar */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 pt-6">
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Projects</div>
            <div className="mt-1 text-2xl font-bold text-white">{totalProjects}</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">{activeProjects} in execution</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Task Velocity</div>
            <div className="mt-1 text-2xl font-bold text-white">{completedTasks} / {totalTasks}</div>
            <div className="text-[11px] text-indigo-300 font-medium mt-0.5">{overallTaskProgress}% overall done</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Portfolio Health</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {projects.filter((p) => p.health === "on-track").length} <span className="text-sm font-normal text-slate-400">on track</span>
            </div>
            <div className="text-[11px] text-amber-400 font-medium mt-0.5">
              {projects.filter((p) => p.health !== "on-track").length} requiring review
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Team Capacity</div>
            <div className="mt-1 text-2xl font-bold text-white">84%</div>
            <div className="text-[11px] text-cyan-300 font-medium mt-0.5">Optimal bandwidth</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, lead, key..."
            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none backdrop-blur-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md outline-none"
          >
            <option value="all">All Disciplines</option>
            <option value="product">Product</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
          </select>

          {/* Health Dropdown */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md outline-none"
          >
            <option value="all">All Health States</option>
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 p-12 text-center backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
            <FolderKanban className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Clean Slate — No Projects Yet
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            You have a pristine workspace. Launch your first project initiative to start tracking deliverables, roadmaps, and timelines.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="gradient"
            className="mt-5 rounded-2xl px-5 py-2.5 text-xs font-bold"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Launch First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>

          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === "done");
            const progress = projectTasks.length
              ? Math.round((doneTasks.length / projectTasks.length) * 100)
              : 0;

            const completedMilestones =
              project.milestones.filter((m) => m.completed).length;
            const healthConfig = healthBadgeStyles[project.health];

            const totalHoursLogged = projectTasks.reduce(
              (acc, t) => acc + (t.loggedHours || 0),
              0,
            );
            const totalHoursEstimated = projectTasks.reduce(
              (acc, t) => acc + (t.estimatedHours || 0),
              0,
            );

            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="soft-card group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-black/5 dark:border-white/10"
              >
                <div>
                  {/* Top Bar with Key, Category & Health */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center rounded-xl px-2.5 py-1 text-xs font-black text-white shadow-sm"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.key}
                      </span>
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {project.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${healthConfig.bg} ${healthConfig.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${healthConfig.dot}`} />
                        {healthConfig.label}
                      </span>

                      <button
                        onClick={() => deleteProject(project.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Project Name and Description */}
                  <div className="mt-4">
                    <Link
                      to={`/projects/${project.id}`}
                      onClick={() => setSelectedProject(project.id)}
                      className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center justify-between">
                        {project.name}
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    </Link>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {doneTasks.length} of {projectTasks.length} Tasks
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                    <ProgressBar
                      value={progress}
                      gradient="from-indigo-500 to-violet-500"
                    />
                  </div>

                  {/* Milestones Preview */}
                  <div className="mt-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-3 border border-black/5 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-indigo-500" /> Milestones
                      </span>
                      <span>
                        {completedMilestones} / {project.milestones.length}
                      </span>
                    </div>
                    {project.milestones.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <span className={`line-clamp-1 ${m.completed ? "line-through text-slate-400" : ""}`}>
                          • {m.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {m.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with Lead, Hours & Budget */}
                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {totalHoursLogged}h
                      </span>{" "}
                      logged
                    </div>

                    {project.budget && (
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        ${(project.budget.spent / 1000).toFixed(1)}k / ${(project.budget.allocated / 1000).toFixed(0)}k
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {project.lead.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {project.lead}
                      </span>
                    </div>

                    <Link
                      to={`/projects/${project.id}`}
                      onClick={() => setSelectedProject(project.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
                    >
                      Workspace <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      )}

      {/* Project Creation Modal */}

      <ProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
