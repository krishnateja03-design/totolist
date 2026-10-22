import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Settings,
  Plus,
  LayoutDashboard,
  Calendar,
  ChartNoAxesCombined,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const actions = [
  ["Create task", "/board", Plus],
  ["Open dashboard", "/", LayoutDashboard],
  ["Open board", "/board", Calendar],
  ["View analytics", "/analytics", ChartNoAxesCombined],
  ["Open settings", "/settings", Settings],
] as const;
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const nav = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start bg-slate-950/35 p-4 pt-[12vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="glass mx-auto w-full max-w-2xl rounded-[2rem] p-4"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 dark:bg-slate-800">
              <Search />
              <input
                autoFocus
                placeholder="Search tasks, create actions, navigate pages..."
                className="w-full bg-transparent outline-none"
              />
            </div>
            <div className="mt-3 grid gap-2">
              {actions.map(([label, to, Icon]) => (
                <button
                  key={label}
                  onClick={() => {
                    nav(to);
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-2xl p-3 text-left font-bold hover:bg-white/70 dark:hover:bg-slate-800"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <Icon size={18} />
                  </span>
                  {label}
                  <span className="ml-auto text-xs text-slate-400">↵</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
