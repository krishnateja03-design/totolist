import { motion } from "framer-motion";
import { Bell, CheckCircle2, Clock, Users } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const icons = { task: Bell, reminder: Clock, team: Users, done: CheckCircle2 };

export function NotificationsDropdown({ onClose }: { onClose?: () => void }) {
  const ns = useAppStore((s) => s.notifications);
  const mark = useAppStore((s) => s.markNotification);

  return (
    <>
      {onClose && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30"
          aria-hidden="true"
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        className="glass absolute right-0 z-40 mt-3 w-80 rounded-3xl p-3 shadow-2xl"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-black">Notifications</h3>
          <span className="text-xs font-bold text-slate-400">
            {ns.filter((n) => !n.read).length} new
          </span>
        </div>

        {ns.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            No notifications
          </div>
        ) : (
          <div className="space-y-1">
            {ns.map((n) => {
              const Icon = icons[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => mark(n.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                    n.read
                      ? "opacity-60 hover:opacity-100 hover:bg-white/70 dark:hover:bg-slate-800"
                      : "bg-white/90 shadow-sm dark:bg-slate-800"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-sm">{n.title}</b>
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {n.message}
                    </p>
                    <small className="mt-1 block text-[11px] text-slate-400">
                      {n.time}
                    </small>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
