import { team } from "../data/sampleData";
import { Avatar } from "../components/Avatar";
import { ProgressBar } from "../components/ProgressBar";
import { useAppStore } from "../store/useAppStore";
import { Users, Briefcase, Clock, CheckCircle2 } from "lucide-react";

export default function Team() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
          <Users className="h-4 w-4" /> Team Bandwidth & Allocation
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          Team Capacity & Workload
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Resource distribution, active project assignments, and velocity across team leads.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {team.map((m) => {
          // Tasks assigned to this team member (using avatar initials)
          const assignedTasks = tasks.filter((t) => t.assignees.includes(m.avatar));
          const completedCount = assignedTasks.filter((t) => t.status === "done").length;
          const hoursLogged = assignedTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);

          return (
            <div
              key={m.id}
              className="soft-card rounded-3xl p-6 text-center border border-black/5 dark:border-white/10 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <div
                  className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${m.ring} p-1 shadow-lg`}
                >
                  <div className="grid h-full w-full place-items-center rounded-full bg-white dark:bg-slate-900">
                    <Avatar name={m.avatar} gradient={m.ring} />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {m.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.role}</p>

                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      m.online
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        m.online ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {m.online ? "Online Now" : "Away"}
                  </span>
                </div>

                {/* Assigned Projects Badges */}
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {projects
                    .filter((p) => p.lead.includes(m.name) || m.assignedProjects?.includes(p.id))
                    .map((p) => (
                      <span
                        key={p.id}
                        className="rounded-lg px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.key}
                      </span>
                    ))}
                </div>

                {/* Task Throughput stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/5 dark:border-white/5 pt-3 text-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Deliverables
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {completedCount} / {assignedTasks.length} done
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Logged Time
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {hoursLogged}h
                    </div>
                  </div>
                </div>
              </div>

              {/* Bandwidth Bar */}
              <div className="mt-5 text-left border-t border-black/5 dark:border-white/5 pt-3">
                <div className="mb-1.5 flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Bandwidth Utilization</span>
                  <span className="text-slate-800 dark:text-slate-200">{m.workload}%</span>
                </div>
                <ProgressBar value={m.workload} gradient={m.ring} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
