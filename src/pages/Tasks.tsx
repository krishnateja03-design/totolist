import { useMemo, useState } from "react";
import { Search, Trash2, CheckSquare, Square, CheckCircle2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { priorityStyles } from "../utils/classNames";

const ITEMS_PER_PAGE = 5;

export default function Tasks() {
  const tasks = useAppStore((s) => s.tasks);
  const del = useAppStore((s) => s.deleteTask);
  const updateTask = useAppStore((s) => s.updateTask);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (status === "all" || t.status === status) &&
          (t.title.toLowerCase().includes(q.toLowerCase()) ||
            t.description.toLowerCase().includes(q.toLowerCase())),
      ),
    [tasks, q, status],
  );

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  const allVisibleSelected =
    rows.length > 0 && rows.every((t) => selectedIds.includes(t.id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !rows.some((r) => r.id === id)));
    } else {
      const visibleIds = rows.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => del(id));
    setSelectedIds([]);
  }

  function handleBulkMarkDone() {
    selectedIds.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        updateTask({ ...task, status: "done", progress: 100 });
      }
    });
    setSelectedIds([]);
  }

  return (
    <div className="soft-card rounded-[2.5rem] p-6 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black gradient-text">Task List</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, bulk manage, and review your tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-3 py-1.5 dark:bg-slate-800">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkMarkDone}
                className="flex items-center gap-1 rounded-xl bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-emerald-600"
              >
                <CheckCircle2 size={13} />
                <span>Mark Done</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded-xl bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-rose-600"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700">
            <Search size={16} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search tasks..."
              className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-56"
            />
          </div>

          <select
            aria-label="Status filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-slate-200/70 outline-none dark:bg-slate-800 dark:ring-slate-700"
          >
            <option value="all">All Statuses</option>
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
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
              <th className="w-12 p-3 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  aria-label="Select all tasks on page"
                  className="grid place-items-center text-slate-400 hover:text-indigo-600"
                >
                  {allVisibleSelected ? (
                    <CheckSquare size={18} className="text-indigo-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm font-bold text-slate-400">
                  No tasks found matching your criteria.
                </td>
              </tr>
            ) : (
              rows.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <tr
                    key={t.id}
                    className={`rounded-2xl transition ${
                      isSelected
                        ? "bg-indigo-50/80 ring-2 ring-indigo-400 dark:bg-slate-800/90"
                        : "bg-white/80 shadow-sm dark:bg-slate-800/70"
                    }`}
                  >
                    <td className="rounded-l-2xl p-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelect(t.id)}
                        aria-label={`Select task ${t.title}`}
                        className="grid place-items-center text-slate-400 hover:text-indigo-600"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-indigo-600" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="py-3">
                      <b className="text-slate-900 dark:text-white">{t.title}</b>
                      <p className="line-clamp-1 text-xs text-slate-500">{t.description}</p>
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${priorityStyles[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black capitalize text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {t.status}
                      </span>
                    </td>
                    <td className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-28 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            style={{ width: `${t.progress}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {t.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="rounded-r-2xl pr-4 text-right">
                      <button
                        aria-label="Delete task"
                        onClick={() => del(t.id)}
                        className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm font-bold text-slate-500">
        <span>
          Showing {rows.length} of {filteredTasks.length} tasks
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/70 transition disabled:opacity-40 dark:bg-slate-800 dark:ring-slate-700"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`h-9 w-9 rounded-xl font-bold transition shadow-sm ${
                currentPage === num
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                  : "bg-white ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/70 transition disabled:opacity-40 dark:bg-slate-800 dark:ring-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
