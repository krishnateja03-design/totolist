import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock, Flame, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

import { useAppStore } from '../store/useAppStore';
import { AnimatedCounter } from '../components/AnimatedCounter';

const cardGrad = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
];

export default function Dashboard() {
  const tasks = useAppStore(s => s.tasks);

  const completed = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.filter(t => t.status === 'progress').length;
  const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const recentTasks = tasks.slice(0, 4);

  const urgentTasks = tasks.filter(t => t.priority === 'urgent').length;
  const highTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowTasks = tasks.filter(t => t.priority === 'low').length;

  const kpis: [string, number, LucideIcon][] = [
    ['Total Tasks', tasks.length, Zap],
    ['Completed', completed, CheckCircle2],
    ['In Progress', progress, Clock],
    ['Overdue', overdue, Flame],
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 p-8 text-white shadow-2xl">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute right-10 top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl"
        />

        <motion.div
          animate={{ x: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute bottom-0 left-1/2 h-56 w-56 rounded-full bg-pink-300/30 blur-3xl"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="font-bold text-cyan-100">Personal Task Manager</p>

            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Welcome back, Krishna.
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Organize your tasks, stay focused, and finish what matters most.
            </p>

            <button
              onClick={() =>
                confetti({
                  particleCount: 120,
                  spread: 70,
                  origin: { y: 0.65 },
                })
              }
              className="mt-6 rounded-2xl bg-white px-5 py-3 font-black text-indigo-600 shadow-xl"
            >
              Celebrate a Win 🎉
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="hidden rounded-[2rem] border border-white/40 bg-white/20 p-5 shadow-2xl backdrop-blur-xl lg:block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white/70">Today Focus</p>
                <h3 className="mt-1 text-2xl font-black text-white">Start simple</h3>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600 shadow-xl">
                ⚡
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {['Create first task', 'Move task to progress', 'Complete one priority item'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 text-slate-800 shadow-lg"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold">{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950/20 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-white">
                <span>Daily flow</span>
                <span>{tasks.length} tasks</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: tasks.length === 0 ? '12%' : `${Math.min(tasks.length * 18, 100)}%`,
                  }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-white"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map(([label, value, Icon], i) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -7, scale: 1.02 }}
            className="soft-card rounded-[2rem] p-5"
          >
            <div
              className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${cardGrad[i]} text-white shadow-lg`}
            >
              <Icon />
            </div>

            <p className="text-sm font-bold text-slate-500">{label}</p>

            <div className="mt-1 text-3xl font-black">
              <AnimatedCounter value={value} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="soft-card rounded-[2rem] p-6">
          <h2 className="mb-4 text-xl font-black">Today’s Plan</h2>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center dark:bg-slate-800/60">
              <p className="font-bold text-slate-600 dark:text-slate-300">No tasks yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first task to start planning your day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="rounded-2xl bg-white/70 p-4 shadow-sm dark:bg-slate-800/70">
                  <p className="font-bold">{task.title}</p>
                  <p className="mt-1 text-sm capitalize text-slate-500">{task.priority} priority</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="soft-card rounded-[2rem] p-6">
          <h2 className="mb-4 text-xl font-black">Upcoming Tasks</h2>

          {upcomingTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center dark:bg-slate-800/60">
              <p className="font-bold text-slate-600 dark:text-slate-300">Nothing scheduled</p>
              <p className="mt-1 text-sm text-slate-500">Tasks with due dates will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 shadow-sm dark:bg-slate-800/70"
                >
                  <div>
                    <p className="font-bold">{task.title}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">{task.status}</p>
                  </div>

                  <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="soft-card rounded-[2rem] p-6">
          <h2 className="mb-4 text-xl font-black">Priority Summary</h2>

          <div className="space-y-4">
            {[
              ['Urgent', urgentTasks, 'bg-rose-500'],
              ['High', highTasks, 'bg-amber-500'],
              ['Medium', mediumTasks, 'bg-indigo-500'],
              ['Low', lowTasks, 'bg-emerald-500'],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <div className="mb-2 flex items-center justify-between text-sm font-bold">
                  <span>{label}</span>
                  <span>{value as number}</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: tasks.length === 0 ? '0%' : `${Math.round(((value as number) / tasks.length) * 100)}%`,
                    }}
                    transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${color as string}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="soft-card rounded-[2rem] p-6">
          <h2 className="mb-4 text-xl font-black">Recent Tasks</h2>

          {recentTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center dark:bg-slate-800/60">
              <p className="font-bold text-slate-600 dark:text-slate-300">No activity yet</p>
              <p className="mt-1 text-sm text-slate-500">Your latest tasks will show here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm dark:bg-slate-800/70">
                  <span className="h-3 w-3 rounded-full bg-indigo-500" />
                  <div>
                    <p className="font-bold">{task.title}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">{task.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}