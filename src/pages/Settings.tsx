import { useState } from "react";
import { Moon, Sun, Trash2, ShieldCheck, Check, Bell } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

function SettingRow({
  icon,
  iconBg,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconBg} text-white`}>
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export default function Settings() {
  const toggle = useAppStore((s) => s.toggleTheme);
  const theme = useAppStore((s) => s.theme);
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const [resetDone, setResetDone] = useState(false);

  function handleCleanSlate() {
    if (window.confirm("This will permanently delete all projects, tasks, and notifications. Are you sure?")) {
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
    <div className="max-w-2xl space-y-5 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-xs text-slate-400">Workspace and system preferences.</p>
      </div>

      {/* Appearance */}
      <div className="soft-card rounded-xl border border-slate-200/80 dark:border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Appearance</h2>
        </div>
        <div className="px-5 divide-y divide-slate-100 dark:divide-white/5">
          <SettingRow
            icon={theme === "light" ? <Sun size={15} /> : <Moon size={15} />}
            iconBg="bg-indigo-600"
            title="Interface Theme"
            description={`Currently active: ${theme} mode`}
            action={
              <button
                onClick={toggle}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition"
              >
                Switch to {theme === "light" ? "Dark" : "Light"}
              </button>
            }
          />
        </div>
      </div>

      {/* Workspace */}
      <div className="soft-card rounded-xl border border-slate-200/80 dark:border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workspace</h2>
        </div>
        <div className="px-5 divide-y divide-slate-100 dark:divide-white/5">
          <SettingRow
            icon={<ShieldCheck size={15} />}
            iconBg="bg-emerald-600"
            title="Local Storage Persistence"
            description="Projects and state saved automatically in your browser"
            action={
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Active
              </span>
            }
          />
          <SettingRow
            icon={<Bell size={15} />}
            iconBg="bg-violet-600"
            title="Notification Alerts"
            description="Deadline reminders and sprint delivery notices"
            action={
              <span className="rounded-full bg-violet-50 dark:bg-violet-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                Enabled
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="soft-card rounded-xl border border-slate-200/80 dark:border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workspace Stats</h2>
        </div>
        <div className="px-5 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Projects</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tasks</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {tasks.filter((t) => t.status === "done").length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Done</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="soft-card rounded-xl border border-rose-200/70 dark:border-rose-900/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-rose-100 dark:border-rose-900/20 bg-rose-50/40 dark:bg-rose-950/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Danger Zone</h2>
        </div>
        <div className="px-5 py-2">
          <SettingRow
            icon={<Trash2 size={15} />}
            iconBg="bg-rose-600"
            title="Reset Workspace"
            description={`Permanently purge ${projects.length} projects and ${tasks.length} tasks`}
            action={
              <button
                onClick={handleCleanSlate}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
              >
                {resetDone ? <Check size={13} /> : <Trash2 size={13} />}
                <span>{resetDone ? "Wiped!" : "Reset Data"}</span>
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
