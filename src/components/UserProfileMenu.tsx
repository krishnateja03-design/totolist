import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./Avatar";
import { User as UserType } from "../types";

interface UserProfileMenuProps {
  user: UserType;
  onLogout: () => void;
}

export function UserProfileMenu({ user, onLogout }: UserProfileMenuProps) {
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
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar name={user.avatar || user.name.slice(0, 2).toUpperCase()} />
        <span className="hidden md:block max-w-[100px] truncate text-left text-xs font-semibold text-slate-700 dark:text-slate-200">
          {user.name}
        </span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md z-50 text-xs"
          >
            {/* User Info Header */}
            <div className="px-2.5 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
              <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {user.role || "Project Lead"}
              </span>
            </div>

            {/* Menu Links */}
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Settings size={14} className="text-slate-400" />
              <span>Account & Workspace Settings</span>
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition mt-1"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

