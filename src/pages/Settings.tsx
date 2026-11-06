import { useState } from "react";
import {
  Trash2,
  ShieldCheck,
  Check,
  Bell,
  Lock,
  User,
  LogOut,
  Mail,
  KeyRound,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { api } from "../utils/api";
import { Button } from "../components/Button";

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconBg} text-white shadow-xs`}>
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:self-center">{action}</div>
    </div>
  );
}

export default function Settings() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const logout = useAppStore((s) => s.logout);
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const clearAllData = useAppStore((s) => s.clearAllData);

  // Profile Form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [role, setRole] = useState(currentUser?.role || "Project Lead");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [resetDone, setResetDone] = useState(false);

  // Handle Profile Update
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) {
      setProfileMsg({ type: "error", text: "Name cannot be empty" });
      return;
    }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await api.updateProfile(currentUser.id, name.trim(), role.trim());
      if (res.user) {
        setCurrentUser(res.user);
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setProfileSaving(false);
    }
  }

  // Handle Password Change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    if (newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.changePassword(currentUser.id, currentPassword, newPassword);
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwMsg({ type: "error", text: err.message || "Failed to change password" });
    } finally {
      setPwSaving(false);
    }
  }

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
    <div className="max-w-3xl space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Workspace & Account Settings</h1>
          <p className="mt-0.5 text-xs text-slate-400">Manage your profile, security, and project storage.</p>
        </div>
        {currentUser && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* ─── Profile & Personal Information ─── */}
      <div className="soft-card rounded-xl border border-slate-200/80 dark:border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <User size={14} className="text-indigo-500" />
            Profile Details
          </h2>
          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
                <Mail size={12} /> {currentUser.email}
              </span>
            )}
            <button
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setProfileMsg(null);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {isEditingProfile ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
            {profileMsg && (
              <div
                className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {profileMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organizational Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Project Lead / Staff Engineer"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={profileSaving}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
              >
                {profileSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-md shadow-indigo-500/20 text-sm">
                {currentUser?.avatar || "US"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.name}</h3>
                <p className="text-xs text-slate-400">{currentUser?.email}</p>
                <span className="inline-block mt-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentUser?.role || "Project Lead"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Security & Change Password ─── */}
      <div className="soft-card rounded-xl border border-slate-200/80 dark:border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lock size={14} className="text-violet-500" />
            Security & Credentials
          </h2>
          <button
            onClick={() => {
              setIsChangingPassword(!isChangingPassword);
              setPwMsg(null);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {isChangingPassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            {pwMsg && (
              <div
                className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
                  pwMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {pwMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{pwMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full sm:max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={pwSaving}
                className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Account Password</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Encrypted with salted scrypt hashing</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">••••••••••••</span>
          </div>
        )}
      </div>

      {/* ─── Workspace Telemetry & Sync ─── */}
      <div className="soft-card rounded-xl border border-slate-200/80 dark:border-white/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Database & System Telemetry
          </h2>
        </div>
        <div className="px-5 divide-y divide-slate-100 dark:divide-white/5">
          <SettingRow
            icon={<ShieldCheck size={15} />}
            iconBg="bg-emerald-600"
            title="SQLite Database & REST Persistence"
            description="All projects, tasks, and users persisted locally in proflow.db"
            action={
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-400/20">
                Connected
              </span>
            }
          />
          <SettingRow
            icon={<Bell size={15} />}
            iconBg="bg-sky-600"
            title="Notification Alerts"
            description="Sprint deadlines, blockers, and milestone updates"
            action={
              <span className="rounded-full bg-sky-50 dark:bg-sky-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                Active
              </span>
            }
          />
        </div>

        {/* Stats */}
        <div className="px-5 py-4 grid grid-cols-3 gap-4 text-center border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-slate-900/20">
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Projects</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Work Items</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {tasks.filter((t) => t.status === "done").length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Completed</div>
          </div>
        </div>
      </div>

      {/* ─── Danger Zone ─── */}
      <div className="soft-card rounded-xl border border-rose-200/70 dark:border-rose-900/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-rose-100 dark:border-rose-900/20 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Danger Zone
          </h2>
        </div>
        <div className="px-5 py-2">
          <SettingRow
            icon={<Trash2 size={15} />}
            iconBg="bg-rose-600"
            title="Purge Workspace Data"
            description={`Permanently reset ${projects.length} projects and ${tasks.length} work items`}
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
