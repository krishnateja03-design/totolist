import { KanbanBoard } from "../features/KanbanBoard";

export default function Board() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[2rem] bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-900/60 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-indigo-500">Workspace Pipeline</p>
          <h1 className="text-3xl font-black">Kanban Board</h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag and drop tasks between columns to update their workflow status.
          </p>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
}
