import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ListChecks } from "lucide-react";

import { KanbanBoard } from "../features/KanbanBoard";
import Tasks from "./Tasks";

type ViewMode = "board" | "list";

export default function Board() {
  const [view, setView] = useState<ViewMode>("board");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[2rem] bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:bg-slate-900/60 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-indigo-500">My Board</p>
          <h1 className="text-3xl font-black">Personal Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            Switch between visual board and detailed list view.
          </p>
        </div>

        <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setView("board")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              view === "board" ? "text-white" : "text-slate-500"
            }`}
          >
            {view === "board" && (
              <motion.span
                layoutId="board-view-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg"
              />
            )}
            <LayoutDashboard size={16} className="relative" />
            <span className="relative">Board View</span>
          </button>

          <button
            onClick={() => setView("list")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              view === "list" ? "text-white" : "text-slate-500"
            }`}
          >
            {view === "list" && (
              <motion.span
                layoutId="board-view-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
              />
            )}
            <ListChecks size={16} className="relative" />
            <span className="relative">List View</span>
          </button>
        </div>
      </div>

      {view === "board" ? <KanbanBoard /> : <Tasks />}
    </div>
  );
}
