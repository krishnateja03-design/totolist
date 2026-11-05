import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  Kanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "../components/Button";

export function LandingPage({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Layers size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-300 via-violet-200 to-sky-300 bg-clip-text text-transparent">
              ProFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
            >
              Sign In
            </button>
            <Button
              onClick={onOpenAuth}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-16 px-6">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-6"
            >
              <Zap size={13} />
              <span>Next-Generation Project Management</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
            >
              Deliver projects faster,{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                without the chaos
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              ProFlow unites your sprint boards, task pipelines, roadmaps, and delivery telemetry in one blazing-fast workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-105"
              >
                <span>Start for free</span>
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          </div>

          {/* Product Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-5xl mx-auto rounded-2xl border border-white/10 bg-slate-800/60 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-xl bg-slate-950 p-6 border border-white/5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-medium text-slate-500">app.proflow.io/board</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sprint 42 Live
                </span>
              </div>

              {/* Mock Kanban Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-900/80 p-3 border border-white/5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Backlog</span>
                    <span className="text-slate-500">3</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-md bg-slate-800/90 border border-white/5 text-xs font-medium">
                      API Gateway Rate Limiting
                    </div>
                    <div className="p-2.5 rounded-md bg-slate-800/90 border border-white/5 text-xs font-medium">
                      Multi-Tenant SSO Integration
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/80 p-3 border border-white/5">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>In Progress</span>
                    <span className="text-indigo-400">2</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-md bg-slate-800/90 border border-indigo-500/30 text-xs font-medium">
                      Telemetry Analytics Engine
                    </div>
                    <div className="p-2.5 rounded-md bg-slate-800/90 border border-white/5 text-xs font-medium">
                      Postgres Replica Tuning
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/80 p-3 border border-white/5">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Completed</span>
                    <span className="text-emerald-400">12</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-md bg-slate-800/90 border border-emerald-500/20 text-xs font-medium text-slate-300">
                      OAuth 2.0 PKCE Flow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Row */}
        <section className="py-16 px-6 border-t border-white/10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-white/5 bg-slate-800/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500/20 text-indigo-400 mb-4">
                <Kanban size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Agile Workflow Boards</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Drag-and-drop Kanban pipelines with WIP constraints, priority chips, and instantaneous local persistence.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/5 bg-slate-800/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 mb-4">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Delivery Velocity Telemetry</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Executive metrics on sprint throughput, billable hours, and budget utilization tracked in real time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/5 bg-slate-800/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-500/20 text-sky-400 mb-4">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Enterprise Privacy</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Local-first SQLite storage with salted cryptographic password hashing and zero data leakage.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© 2026 ProFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

