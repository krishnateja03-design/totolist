import { useState, useRef, useEffect } from "react";
import { Plus, FolderKanban, CheckSquare, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickCreateDropdownProps {
  onNewTask: () => void;
  onNewProject: () => void;
  className?: string;
}

export function QuickCreateDropdown({
  onNewTask,
  onNewProject,
  className = "",
}: QuickCreateDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Plus size={14} />
        <span>Create</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-md z-50 text-xs"
          >
            <button
              onClick={() => {
                setOpen(false);
                onNewTask();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <div className="grid h-6 w-6 place-items-center rounded-md bg-indigo-500/10 text-indigo-500">
                <CheckSquare size={13} />
              </div>
              <div>
                <span className="block font-semibold">New Task</span>
                <span className="block text-[10px] text-slate-400">Add work item to board</span>
              </div>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                onNewProject();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <div className="grid h-6 w-6 place-items-center rounded-md bg-violet-500/10 text-violet-500">
                <FolderKanban size={13} />
              </div>
              <div>
                <span className="block font-semibold">New Project</span>
                <span className="block text-[10px] text-slate-400">Initiate new workspace</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

