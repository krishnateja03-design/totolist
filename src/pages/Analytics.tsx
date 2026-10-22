import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useAppStore } from "../store/useAppStore";

const statusColors = ["#64748B", "#8B5CF6", "#06B6D4", "#F59E0B", "#10B981"];
const priorityColors = ["#10B981", "#6366F1", "#F59E0B", "#F43F5E"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="soft-card rounded-[2rem] p-5">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}

export default function Analytics() {
  const tasks = useAppStore((s) => s.tasks);

  const completed = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

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

  const priorityData = [
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length },
    {
      name: "Medium",
      value: tasks.filter((t) => t.priority === "medium").length,
    },
    { name: "High", value: tasks.filter((t) => t.priority === "high").length },
    {
      name: "Urgent",
      value: tasks.filter((t) => t.priority === "urgent").length,
    },
  ];

  return (
    <div>
      <h1 className="mb-2 text-4xl font-black gradient-text">My Insights</h1>
      <p className="mb-6 text-slate-500">
        Track your personal task progress and focus patterns.
      </p>

      <div className="mb-5 grid gap-5 md:grid-cols-3">
        <div className="soft-card rounded-[2rem] p-6">
          <p className="text-sm font-bold text-slate-500">Total Tasks</p>
          <h2 className="mt-2 text-4xl font-black">{total}</h2>
        </div>

        <div className="soft-card rounded-[2rem] p-6">
          <p className="text-sm font-bold text-slate-500">Completed</p>
          <h2 className="mt-2 text-4xl font-black">{completed}</h2>
        </div>

        <div className="soft-card rounded-[2rem] p-6">
          <p className="text-sm font-bold text-slate-500">Completion Rate</p>
          <h2 className="mt-2 text-4xl font-black">{completionRate}%</h2>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Task Status">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={5}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={statusColors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority Breakdown">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={5}
              >
                {priorityData.map((_, i) => (
                  <Cell key={i} fill={priorityColors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
