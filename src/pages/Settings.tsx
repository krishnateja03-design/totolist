import { useAppStore } from "../store/useAppStore";
export default function Settings() {
  const toggle = useAppStore((s) => s.toggleTheme),
    theme = useAppStore((s) => s.theme);
  return (
    <div className="soft-card max-w-3xl rounded-[2.5rem] p-8">
      <h1 className="text-4xl font-black gradient-text">Settings</h1>
      <p className="mt-2 text-slate-500">
        Theme, persistence, workspace preferences, and notification controls.
      </p>
      <div className="mt-8 flex items-center justify-between rounded-3xl bg-white/70 p-5 dark:bg-slate-800/70">
        <div>
          <b>Theme</b>
          <p className="text-sm text-slate-500">
            Persisted in localStorage with Zustand.
          </p>
        </div>
        <button
          onClick={toggle}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 font-black text-white"
        >
          {theme}
        </button>
      </div>
    </div>
  );
}
