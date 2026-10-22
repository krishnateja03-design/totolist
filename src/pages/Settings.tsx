import { useState } from "react";
import { Moon, Sun, Bell, Trash2, ShieldCheck, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { tasks as defaultTasks, notifications as defaultNotifs } from "../data/sampleData";

export default function Settings() {
  const toggle = useAppStore((s) => s.toggleTheme);
  const theme = useAppStore((s) => s.theme);
  const tasks = useAppStore((s) => s.tasks);
  const [resetDone, setResetDone] = useState(false);

  function handleResetData() {
    if (window.confirm("Are you sure you want to reset tasks and notifications to sample defaults?")) {
      localStorage.removeItem("wow-saas-productivity-store");
      window.location.reload();
    }
  }

  function handleClearAllTasks() {
    if (window.confirm("Delete all tasks? This cannot be undone.")) {
      tasks.forEach((t) => useAppStore.getState().deleteTask(t.id));
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2000);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-black gradient-text">Settings</h1>
        <p className="mt-1 text-slate-500">
          Personalize your workspace, manage data persistence, and configure defaults.
        </p>
      </div>

      <div className="soft-card space-y-6 rounded-[2.5rem] p-8 shadow-xl">
        <h2 className="text-xl font-black">Appearance</h2>
        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            </span>
            <div>
              <b className="text-base">Interface Theme</b>
              <p className="text-sm text-slate-500">
                Currently using {theme} mode.
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 font-bold text-white shadow-md transition hover:opacity-95"
          >
            Switch to {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </div>

      <div className="soft-card space-y-6 rounded-[2.5rem] p-8 shadow-xl">
        <h2 className="text-xl font-black">Data & Workspace</h2>
        
        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <ShieldCheck size={20} />
            </span>
            <div>
              <b className="text-base">Local Persistence</b>
              <p className="text-sm text-slate-500">
                All tasks are automatically saved to your browser&apos;s localStorage.
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Trash2 size={20} />
            </span>
            <div>
              <b className="text-base">Clear All Tasks</b>
              <p className="text-sm text-slate-500">
                Delete all {tasks.length} tasks currently saved.
              </p>
            </div>
          </div>
          <button
            onClick={handleClearAllTasks}
            className="flex items-center gap-1.5 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
          >
            {resetDone ? <Check size={16} /> : <Trash2 size={16} />}
            <span>{resetDone ? "Cleared" : "Clear All"}</span>
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-5 shadow-sm dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Bell size={20} />
            </span>
            <div>
              <b className="text-base">Reset to Sample Data</b>
              <p className="text-sm text-slate-500">
                Restore default tasks, team members, and demo notifications.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetData}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
