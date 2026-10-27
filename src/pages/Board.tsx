import { useState } from "react";
import { KanbanBoard } from "../features/KanbanBoard";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/Button";
import { TaskModal } from "../features/TaskModal";
import { Plus, Filter, Kanban, Folder } from "lucide-react";
import { Status } from "../types";

export default function Board() {
  const projects = useAppStore((s) => s.projects);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const tasks = useAppStore((s) => s.tasks);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const displayedTasks = tasks.filter((t) =>
    selectedProjectId === "all" ? true : t.projectId === selectedProjectId,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner and Project Selector Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl border border-black/5 dark:border-white/10 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
            <Kanban className="h-4 w-4" /> Agile Workflow Pipeline
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {activeProject ? activeProject.name : "All Projects Kanban"}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activeProject
              ? `Showing work items for [${activeProject.key}] • ${displayedTasks.length} total tasks`
              : `Showing cross-project pipeline across all ${projects.length} initiatives • ${displayedTasks.length} total tasks`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Switcher */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-xs font-semibold backdrop-blur-md">
            <Folder className="h-3.5 w-3.5 text-indigo-500" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-bold"
            >
              <option value="all">All Initiatives (Cross-Project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setIsTaskModalOpen(true)}
            variant="gradient"
            className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Work Item
          </Button>
        </div>
      </div>

      <KanbanBoard
        selectedProjectId={selectedProjectId}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
      />

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
