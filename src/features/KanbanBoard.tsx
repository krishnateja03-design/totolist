/**
 * @file features/KanbanBoard.tsx
 * @description Drag-and-drop Kanban board powered by @dnd-kit/core.
 *
 * This feature renders the five pipeline columns (Backlog → Done) and enables
 * drag-and-drop reordering of tasks between columns. When a task is dropped
 * onto a different column, the task's `status` is updated in the global store
 * via `useAppStore.moveTask()`.
 *
 * Architecture:
 *   - KanbanBoard   → Root component; owns the DndContext and drag state
 *   - Column        → A single droppable stage (uses useDroppable from @dnd-kit)
 *   - DraggableTask → A wrapper around TaskCard that makes it draggable (useDraggable)
 *   - DragOverlay   → A floating "ghost" card that follows the cursor during drag
 *
 * Drag-and-Drop Flow:
 *   1. User grabs a task card (PointerSensor activates after 8px of movement)
 *   2. `onDragStart` stores the active task for rendering the DragOverlay ghost
 *   3. `onDragEnd` checks `event.over` (the column the task was dropped on)
 *      and calls `moveTask(taskId, newStatus)` to persist the change
 *   4. The original task card fades to 30% opacity while being dragged
 *
 * Project Filter:
 *   - `selectedProjectId` is passed down to each Column to filter tasks
 *   - "all" shows all tasks; a project ID shows only that project's tasks
 *
 * Quick Add:
 *   - Each column header has a "+" button that opens the TaskModal
 *     pre-set to the column's status via `onOpenTaskModal(status)`
 */

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Status, Task } from "../types";
import { TaskCard } from "../components/TaskCard";

/**
 * DraggableTask — wraps a TaskCard to make it draggable via @dnd-kit.
 *
 * Uses the `useDraggable` hook which provides:
 *   - `setNodeRef`  → Attaches the drag handle to the DOM element
 *   - `listeners`   → Mouse/touch event handlers for drag activation
 *   - `attributes`  → ARIA attributes for accessibility
 *   - `transform`   → CSS transform applied while dragging (follows cursor)
 *   - `isDragging`  → True while this specific card is being dragged
 *
 * While dragging, the original card fades to 30% opacity so users can see
 * the drop target. The DragOverlay (rendered by KanbanBoard) shows a
 * full-opacity ghost card following the cursor.
 *
 * @param task - The task data to render inside the draggable wrapper
 */
function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id, // Must be unique; used by DndContext to identify the dragged item
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform), // Moves card with cursor during drag
        touchAction: "none",                          // Prevents browser scroll interference on touch
      }}
      {...listeners}   // Attach drag start/move/end event handlers
      {...attributes}  // Attach ARIA role="button" and keyboard drag accessibility props
      className={isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab"}
    >
      <TaskCard task={task} />
    </div>
  );
}

/**
 * Column — a single droppable Kanban stage.
 *
 * Uses `useDroppable` from @dnd-kit to register this element as a valid
 * drop target. When `isOver` is true (a task is hovering over this column),
 * the column background changes to a highlighted indigo tint.
 *
 * Each column:
 *   1. Filters all tasks to only show those with matching `status` AND `projectId`
 *   2. Shows a dashed "Drop work items here" empty state when no tasks are present
 *   3. Has a count badge next to its title showing how many tasks it contains
 *   4. Has a "+" button that calls `onOpenTaskModal` with the column's status
 *      so the TaskModal pre-selects the correct pipeline stage
 *
 * @param id               - The Status value used as the droppable zone ID (e.g., "backlog")
 * @param title            - Human-readable column name (e.g., "Backlog")
 * @param gradient         - Tailwind gradient classes for the header badge
 * @param selectedProjectId - "all" or a project ID to scope visible tasks
 * @param onOpenTaskModal  - Callback to open TaskModal with this column's status pre-set
 */
function Column({
  id,
  title,
  gradient,
  selectedProjectId,
  onOpenTaskModal,
}: {
  id: Status;
  title: string;
  gradient: string;
  selectedProjectId: string;
  onOpenTaskModal: (status: Status) => void;
}) {
  // Register this section as a droppable zone; isOver indicates active hover
  const { setNodeRef, isOver } = useDroppable({ id });
  const allTasks = useAppStore((s) => s.tasks);

  // Filter tasks to: (a) match the project scope AND (b) belong to this column's status
  const tasks = allTasks
    .filter((t) => (selectedProjectId === "all" ? true : t.projectId === selectedProjectId))
    .filter((t) => t.status === id);

  return (
    <section
      ref={setNodeRef} // Register as drop target for @dnd-kit
      className={`min-h-[560px] rounded-3xl p-4 transition-all duration-200 border border-black/5 dark:border-white/10 ${
        isOver
          ? "bg-indigo-100/70 dark:bg-indigo-950/40 ring-4 ring-indigo-400/50" // Highlighted drop target state
          : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"                // Default resting state
      }`}
    >
      {/* Column header: gradient badge with task count + quick-add button */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`rounded-2xl bg-gradient-to-r ${gradient} px-3.5 py-1.5 text-xs font-black text-white shadow-md flex items-center gap-1.5`}
        >
          <span>{title}</span>
          {/* Task count badge – updates reactively as tasks move in/out */}
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
            {tasks.length}
          </span>
        </div>

        {/* Quick-add button – opens TaskModal with this column's status pre-selected */}
        <button
          onClick={() => onOpenTaskModal(id)}
          className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title={`Add item to ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Task cards list */}
      <div className="space-y-3.5">
        {/* Empty state placeholder – shown when column has no tasks */}
        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs font-semibold text-slate-400">
            Drop work items here
          </div>
        )}

        {/* Render each task as a DraggableTask wrapper around TaskCard */}
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

/**
 * KanbanBoard — the root drag-and-drop board component.
 *
 * Manages the DndContext which coordinates all drag-and-drop events across columns.
 * Renders all five pipeline columns in a horizontal scrollable grid.
 * On desktop (xl+) all five columns are visible; on smaller screens, horizontal scroll activates.
 *
 * @param selectedProjectId - Project scope filter passed down to each Column
 * @param onOpenTaskModal   - Callback from the Board page to open the TaskModal with a specific status
 */
export function KanbanBoard({
  selectedProjectId,
  onOpenTaskModal,
}: {
  selectedProjectId: string;
  onOpenTaskModal: (status: Status) => void;
}) {
  const columns = useAppStore((s) => s.columns);  // Static column definitions from store
  const tasks = useAppStore((s) => s.tasks);       // All tasks (used only for onDragStart lookup)
  const move = useAppStore((s) => s.moveTask);     // Action to change a task's status/column

  /**
   * Stores the task currently being dragged.
   * Used to render the DragOverlay ghost card that follows the cursor.
   * Null when no drag is active.
   */
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  /**
   * PointerSensor with an activation constraint:
   * - The drag starts only after the pointer moves 8px from its initial position.
   * - This prevents accidental drags when the user just clicks to view task details.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  /**
   * Called when a drag starts. Looks up the task by its ID and stores it
   * in `activeTask` so the DragOverlay can render a ghost copy of the card.
   */
  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === String(event.active.id));
    setActiveTask(task ?? null);
  }

  /**
   * Called when a drag ends (mouse/touch released).
   * If the card was dropped over a valid column (`event.over` is not null),
   * calls `moveTask` to update the task's status in the global store.
   * Always clears `activeTask` to hide the DragOverlay.
   */
  function onDragEnd(event: DragEndEvent) {
    if (event.over) {
      // event.over.id is the Column's `id` prop (which matches the Status union value)
      move(String(event.active.id), event.over.id as Status);
    }
    setActiveTask(null); // Hide ghost card overlay after drop
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Horizontal scrollable grid – 5 columns on xl screens, horizontal scroll on smaller */}
      <div className="thin-scroll grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
        {columns.map((column) => (
          <Column
            key={column.id}
            {...column}
            selectedProjectId={selectedProjectId}
            onOpenTaskModal={onOpenTaskModal}
          />
        ))}
      </div>

      {/*
        DragOverlay renders a floating ghost copy of the dragged card.
        It is rendered outside the normal document flow (portal), so it
        always appears above other elements and follows the cursor smoothly.
        The slight rotation and scale give it a "picked up" feel.
      */}
      <DragOverlay>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.04 }} // Slightly bigger than normal to indicate "picked up"
            className="rotate-2 cursor-grabbing shadow-2xl"
          >
            <TaskCard task={activeTask} />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
