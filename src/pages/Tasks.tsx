import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { priorityStyles } from "../utils/classNames";
export default function Tasks() {
  const tasks = useAppStore((s) => s.tasks),
    del = useAppStore((s) => s.deleteTask);
  const [q, setQ] = useState(""),
    [status, setStatus] = useState("all");
  const rows = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (status === "all" || t.status === status) &&
          t.title.toLowerCase().includes(q.toLowerCase()),
      ),
    [tasks, q, status],
  );
  return (
    <div className="soft-card rounded-[2.5rem] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black gradient-text">Task List</h1>
          <p className="text-slate-500">
            Search, filter, sort, bulk review, and paginate tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow dark:bg-slate-800">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none"
            />
          </div>
          <select
            aria-label="Status filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl bg-white px-3 shadow dark:bg-slate-800"
          >
            <option value="all">All</option>
            <option value="backlog">Backlog</option>
            <option value="planned">Planned</option>
            <option value="progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="thin-scroll mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-400">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr
                key={t.id}
                className="rounded-2xl bg-white/75 shadow-sm dark:bg-slate-800/70"
              >
                <td className="rounded-l-2xl p-3">
                  <input type="checkbox" />
                </td>
                <td>
                  <b>{t.title}</b>
                  <p className="text-sm text-slate-500">{t.description}</p>
                </td>
                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${priorityStyles[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                    {t.status}
                  </span>
                </td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                <td>
                  <div className="h-2 w-32 rounded-full bg-slate-100">
                    <div
                      style={{ width: `${t.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                    />
                  </div>
                </td>
                <td className="rounded-r-2xl">
                  <button
                    onClick={() => del(t.id)}
                    className="rounded-xl p-2 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500">
        <span>
          Showing {rows.length} of {tasks.length}
        </span>
        <div className="flex gap-2">
          <button className="rounded-xl bg-white px-3 py-2 shadow dark:bg-slate-800">
            Previous
          </button>
          <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-white shadow">
            1
          </button>
          <button className="rounded-xl bg-white px-3 py-2 shadow dark:bg-slate-800">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
