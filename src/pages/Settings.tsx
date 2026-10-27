import { useState } from "react";
import { Moon, Sun, Trash2, ShieldCheck, Check, Sparkles } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function Settings() {
  const toggle = useAppStore((s) => s.toggleTheme);
  const theme = useAppStore((s) => s.theme);
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const [resetDone, setResetDone] = useState(false);

  function handleCleanSlate() {
    if (
      window.confirm(
        "Are you sure you want to wipe all projects, tasks, and notifications to a 100% clean slate?",
      )
    ) {
      clearAllData();
      localStorage.removeItem("enterprise-project-manager-store-v2");
      localStorage.removeItem("enterprise-project-manager-store");
      localStorage.removeItem("wow-saas-productivity-store");
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
      window.location.reload();
    }
  }

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Personalize interface theme, manage workspace data, and configure clean slate states.
        </p>
      </div>

      <div className="soft-card space-y-6 rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h2>
        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4 shadow-xs dark:bg-slate-800/70 border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            </span>
            <div>
              <b className="text-sm text-slate-900 dark:text-white">Interface Theme</b>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Currently using {theme} mode.
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-95"
          >
            Switch to {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </div>

      <div className="soft-card space-y-5 rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data & Workspace</h2>

        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4 shadow-xs dark:bg-slate-800/70 border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <ShieldCheck size={20} />
            </span>
            <div>
              <b className="text-sm text-slate-900 dark:text-white">Local Persistence</b>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All projects, tasks, and notes are securely stored in your browser.
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Active
          </span>
        </div>

        {/* Clean Slate Action */}
        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4 shadow-xs dark:bg-slate-800/70 border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
              <Trash2 size={20} />
            </span>
            <div>
              <b className="text-sm text-slate-900 dark:text-white">Reset to Clean Slate</b>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly wipe all {projects.length} projects and {tasks.length} tasks to 0.
              </p>
            </div>
          </div>
          <button
            onClick={handleCleanSlate}
            className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
          >
            {resetDone ? <Check size={14} /> : <Trash2 size={14} />}
            <span>{resetDone ? "Wiped Clean" : "Wipe to Clean Slate"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
