/**
 * @file pages/Tasks.tsx
 * @description All Work Items table view with filtering, search, pagination, and bulk actions.
 *
 * This page shows all tasks across all projects (or filtered by project) in a
 * sortable, filterable table layout. It is designed for power users who need to
 * manage large volumes of tasks efficiently.
 *
 * Features:
 *   - Free-text search across task title, description, and tags
 *   - Status filter (All / Backlog / Planned / In Progress / Review / Done)
 *   - Project filter (All / individual project)
 *   - Multi-row checkbox selection with bulk actions:
 *       a) Bulk Delete   – removes all selected tasks permanently
 *       b) Bulk Mark Done – moves all selected tasks to "done" status with 100% progress
 *   - Paginated table (ITEMS_PER_PAGE rows per page) with Previous/Next navigation
 *   - Per-row inline Mark Done / Delete actions
 *   - "+ New Task" button opens the TaskModal
 *
 * Data flow:
 *   - Reads tasks and projects from the global Zustand store
 *   - Filtering is memoized via `useMemo` to avoid unnecessary re-renders
 *   - Pagination is client-side (all data in memory)
 */
import { useMemo, useState } from "react";
import {
  Search,
  Trash2,
  CheckSquare,
  Square,
  CheckCircle2,
  Folder,
  Clock,
  Plus,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { priorityStyles } from "../utils/classNames";
import { TaskModal } from "../features/TaskModal";
import { Button } from "../components/Button";

/** Number of task rows shown per page in the paginated table */
const ITEMS_PER_PAGE = 8;

export default function Tasks() {
  // ─── Store State & Actions ─────────────────────────────────────────────
  const tasks = useAppStore((s) => s.tasks);         // All tasks (unfiltered)
  const projects = useAppStore((s) => s.projects);   // Used to resolve project names from IDs
  const del = useAppStore((s) => s.deleteTask);      // Action to delete one task by ID
  const updateTask = useAppStore((s) => s.updateTask); // Action to update task (used for bulk mark done)

  // ─── Filter & UI State ────────────────────────────────────────────────
  /** The current search query typed in the search box (matches title, description, tags) */
  const [q, setQ] = useState("");
  /** Status filter value – "all" or a specific Status string (backlog, planned, progress, review, done) */
  const [status, setStatus] = useState("all");
  /** Project filter value – "all" or a specific project ID */
  const [projectIdFilter, setProjectIdFilter] = useState("all");
  /** Array of task IDs that the user has checked via checkbox (for bulk operations) */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  /** The currently active page number (1-indexed) */
  const [page, setPage] = useState(1);
  /** Controls visibility of the "Create Task" modal */
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ─── Filtered & Paginated Data ────────────────────────────────────────

  /**
   * Memoized filtered task list. Re-computes only when tasks, query, status, or project filter changes.
   * All three filter conditions must pass (AND logic):
   *   1. matchStatus:  status === "all" OR task.status matches the selected filter
   *   2. matchProject: projectIdFilter === "all" OR task.projectId matches the selected project
   *   3. matchQuery:   query is found in the title, description, OR any tag
   */
  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const matchStatus = status === "all" || t.status === status;
        const matchProject =
          projectIdFilter === "all" || t.projectId === projectIdFilter;
        const matchQuery =
          t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.description.toLowerCase().includes(q.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()));

        return matchStatus && matchProject && matchQuery;
      }),
    [tasks, q, status, projectIdFilter],
  );

  /** Total number of pages based on filtered results. Minimum of 1 to avoid division issues. */
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  /** Clamp current page to valid range (e.g., if filter reduces total pages below current page) */
  const currentPage = Math.min(page, totalPages);

  /**
   * The slice of filteredTasks to show on the current page.
   * Memoized to avoid recomputing on every render.
   */
  const rows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  /** True when every visible row on the current page is checked – drives the header checkbox state */
  const allVisibleSelected =
    rows.length > 0 && rows.every((t) => selectedIds.includes(t.id));

  /**
   * Toggles selection of ALL visible rows on the current page.
   * If all are selected → deselects them. Otherwise → adds all to selection.
   * Uses Set to avoid duplicates when merging with pre-existing selections from other pages.
   */
  function toggleSelectAll() {
    if (allVisibleSelected) {
      // Deselect all visible rows; keep selections from other pages intact
      setSelectedIds((prev) => prev.filter((id) => !rows.some((r) => r.id === id)));
    } else {
      const visibleIds = rows.map((r) => r.id);
      // Merge visible IDs with any already-selected IDs from other pages
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  /**
   * Toggles selection of a single task row.
   * @param id - The task ID to toggle in selectedIds
   */
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  /**
   * Bulk deletes all currently selected tasks.
   * Dispatches deleteTask for each selected ID, then clears the selection.
   */
  function handleBulkDelete() {
    selectedIds.forEach((id) => del(id));
    setSelectedIds([]); // Clear selection after deletion
  }

  /**
   * Bulk marks all selected tasks as "done" with 100% progress.
   * Uses updateTask (full replace) rather than moveTask to also update the progress field.
   * Clears selection after the operation.
   */
  function handleBulkMarkDone() {
    selectedIds.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        // Spread the existing task and override status + progress
        updateTask({ ...task, status: "done", progress: 100 });
      }
    });
    setSelectedIds([]); // Clear selection after marking done
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="soft-card rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
              <Folder className="h-4 w-4" /> Work Items Master Table
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              All Tasks & Deliverables
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Multi-project work tracking, effort estimates, status filters, and bulk operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-3 py-1.5 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={handleBulkMarkDone}
                  className="flex items-center gap-1 rounded-xl bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition"
                >
                  <CheckCircle2 size={13} />
                  <span>Mark Done</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 rounded-xl bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            )}

            <Button
              onClick={() => setIsTaskModalOpen(true)}
              variant="gradient"
              className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold"
            >
              <Plus className="h-4 w-4" /> New Work Item
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-black/5 dark:border-white/5 pt-4">
          <div className="flex items-center gap-2 rounded-2xl bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-xs font-medium shadow-xs ring-1 ring-slate-200/70 dark:ring-white/10 flex-1 min-w-[200px]">
            <Search size={15} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, description, or #tag..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-800 dark:text-white"
            />
          </div>

          {/* Project Filter */}
          <select
            value={projectIdFilter}
            onChange={(e) => {
              setProjectIdFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-xs font-semibold shadow-xs ring-1 ring-slate-200/70 dark:ring-white/10 outline-none text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-xs font-semibold shadow-xs ring-1 ring-slate-200/70 dark:ring-white/10 outline-none text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="planned">Planned</option>
            <option value="progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Master Table */}
        <div className="thin-scroll mt-5 overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-y-2">
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
                <th>Work Item</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Time (Log / Est)</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm font-bold text-slate-400">
                    No work items found matching your criteria.
                  </td>
                </tr>
              ) : (
                rows.map((t) => {
                  const isSelected = selectedIds.includes(t.id);
                  const project = projects.find((p) => p.id === t.projectId);

                  return (
                    <tr
                      key={t.id}
                      className={`rounded-2xl transition ${
                        isSelected
                          ? "bg-indigo-50/80 ring-2 ring-indigo-400 dark:bg-slate-800/90"
                          : "bg-white/80 dark:bg-slate-800/60 shadow-xs"
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
                      <td className="py-3 max-w-[260px]">
                        <b className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {t.title}
                        </b>
                        <p className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {t.description}
                        </p>
                      </td>
                      <td>
                        {project ? (
                          <span
                            className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-black text-white"
                            style={{ backgroundColor: project.color }}
                          >
                            {project.key}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${priorityStyles[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-[11px] font-bold capitalize text-indigo-700 dark:text-indigo-300">
                          {t.status}
                        </span>
                      </td>
                      <td className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-indigo-500" />
                          {t.loggedHours || 0}h / {t.estimatedHours || 4}h
                        </span>
                      </td>
                      <td className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              style={{ width: `${t.progress}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            {t.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="rounded-r-2xl pr-4 text-right">
                        <button
                          aria-label="Delete task"
                          onClick={() => del(t.id)}
                          className="rounded-xl p-1.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="mt-5 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4 text-xs font-medium text-slate-500">
          <div>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} of{" "}
            {filteredTasks.length} work items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <TaskModal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
