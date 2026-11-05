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
    <div className="space-y-5 pb-10">
      {/* Top Selector Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-xl soft-card p-4 border border-slate-200/80 dark:border-white/8 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeProject ? activeProject.name : "Workflow Board"}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {activeProject
              ? `Tracking ${displayedTasks.length} work items in [${activeProject.key}]`
              : `Tracking ${displayedTasks.length} work items across ${projects.length} projects`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Switcher */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium">
            <Folder className="h-3.5 w-3.5 text-indigo-500" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-semibold cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Task
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
