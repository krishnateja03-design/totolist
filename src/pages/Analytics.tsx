import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAppStore } from "../store/useAppStore";
import { FolderKanban, DollarSign, Clock, CheckCircle2, TrendingUp } from "lucide-react";

const statusColors = ["#64748B", "#8B5CF6", "#06B6D4", "#F59E0B", "#10B981"];
const priorityColors = ["#10B981", "#6366F1", "#F59E0B", "#F43F5E"];

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10 flex flex-col justify-between">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export default function Analytics() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);

  const completed = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const totalLoggedHours = tasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
  const totalEstimatedHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const totalBudgetSpent = projects.reduce((acc, p) => acc + (p.budget?.spent || 0), 0);
  const totalBudgetAllocated = projects.reduce((acc, p) => acc + (p.budget?.allocated || 0), 0);

  const statusData = [
    {
      name: "Backlog",
      value: tasks.filter((t) => t.status === "backlog").length,
    },
    {
      name: "Planned",
      value: tasks.filter((t) => t.status === "planned").length,
    },
    {
      name: "In Progress",
      value: tasks.filter((t) => t.status === "progress").length,
    },
    {
      name: "Review",
      value: tasks.filter((t) => t.status === "review").length,
    },
    { name: "Done", value: completed },
  ];

  // Project progress breakdown for bar chart
  const projectComparisonData = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    const pDone = pTasks.filter((t) => t.status === "done").length;
    const hours = pTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
    return {
      key: p.key,
      name: p.name.length > 18 ? p.name.slice(0, 16) + "..." : p.name,
      done: pDone,
      pending: pTasks.length - pDone,
      hours,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
          <TrendingUp className="h-4 w-4" /> Portfolio Velocity & Insights
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          Project Analytics & Telemetry
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Executive metrics on delivery throughput, resource hours, and budget allocations.
        </p>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Portfolio Completion</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {completionRate}%
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {completed} of {total} deliverables shipped
          </p>
        </div>

        <div className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Active Initiatives</span>
            <FolderKanban size={16} className="text-indigo-500" />
          </div>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {projects.length}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {projects.filter((p) => p.health === "on-track").length} on track
          </p>
        </div>

        <div className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Time Logged</span>
            <Clock size={16} className="text-cyan-500" />
          </div>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {totalLoggedHours}h
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            of {totalEstimatedHours}h estimated effort
          </p>
        </div>

        <div className="soft-card rounded-3xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Budget Utilization</span>
            <DollarSign size={16} className="text-amber-500" />
          </div>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            ${(totalBudgetSpent / 1000).toFixed(1)}k
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            of ${(totalBudgetAllocated / 1000).toFixed(0)}k total budget
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Deliverables per Project"
          subtitle="Done vs Pending work items per strategic initiative"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="key" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="done" name="Completed Tasks" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" name="In Pipeline" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Workflow Status Distribution"
          subtitle="Breakdown of all tasks across kanban stages"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={statusColors[i % statusColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
